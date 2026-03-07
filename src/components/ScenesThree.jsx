import { createContext, useContext, useEffect, useRef, useState, Suspense } from 'react';
import '../App.css';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text, useProgress } from '@react-three/drei';
import '../css/honorScene.css';
import { useSpring, animated } from '@react-spring/three';
import JoelImg from '../img/joelG.PNG';
import * as THREE from 'three';

import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import finder from '../img/finder.png';

const FrameFocusContext = createContext();

// ── Soft button click (filtered noise + low thud) ────────────────────────────
function playPsClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    // 1. Short noise burst — the "click" transient
    const samples = Math.floor(ctx.sampleRate * 0.022);
    const buf  = ctx.createBuffer(1, samples, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < samples; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples, 2);
    }
    const noise  = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type            = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value         = 1.2;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.28, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // 2. Low thud — gives the button its weight
    const osc  = ctx.createOscillator();
    const oGain = ctx.createGain();
    osc.connect(oGain);
    oGain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);
    oGain.gain.setValueAtTime(0.18, now);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch (_) {}
}

// ── Scene loader overlay ─────────────────────────────────────────────────────
function SceneLoader() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: '#050505',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: '5rem', fontWeight: 300,
        color: 'rgba(240,240,240,0.88)', lineHeight: 1,
      }}>
        {Math.round(progress)}
      </div>
      <div style={{
        fontFamily: 'Inter, sans-serif', fontSize: '0.55rem',
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: 'rgba(240,240,240,0.32)', marginTop: '0.8rem',
      }}>
        Loading Scene
      </div>
      <div style={{
        width: 180, height: 1,
        background: 'rgba(240,240,240,0.08)', marginTop: '2.4rem', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: 'rgba(240,240,240,0.55)',
          width: `${progress}%`, transition: 'width 0.15s linear',
        }} />
      </div>
    </div>
  );
}

// ── PDF reader ────────────────────────────────────────────────────────────────
const PDFReader = ({ path, name }) => {
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const defaultLayout = defaultLayoutPlugin();

  return !pdfLoaded ? (
    <button className="honors-doc-btn" onClick={() => setPdfLoaded(true)}>
      {name}
    </button>
  ) : (
    <div className="honors-page__pdf-wrap">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer fileUrl={path} plugins={[defaultLayout]} />
      </Worker>
    </div>
  );
};

// ── Camera control (no OrbitControls — purely lerped) ────────────────────────
function CameraControl({ target }) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 8));
  const targetLookAt   = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt  = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (target === 'frames') {
      targetPosition.current.set(-1, 0, 0);
      targetLookAt.current.set(-5, 0, 0);
    } else if (target === 'books') {
      targetPosition.current.set(-2, -1, 5);
      targetLookAt.current.set(0, 0, 0);
    } else {
      targetPosition.current.set(0, 0, 8);
      targetLookAt.current.set(0, 0, 0);
    }
  }, [target]);

  useFrame(() => {
    camera.position.lerp(targetPosition.current, 0.05);
    currentLookAt.current.lerp(targetLookAt.current, 0.05);
    camera.lookAt(currentLookAt.current);
  });

  return <OrbitControls enablePan={false} enableZoom={false} />;
}

// ── Frame mesh ────────────────────────────────────────────────────────────────
function FrameExperiences({ position, scale, imageUrl, name, args, text }) {
  const textRef  = useRef();
  const texture  = useLoader(THREE.TextureLoader, imageUrl);
  const [textVisible, setTextVisible] = useState(0);
  const { targetFocus } = useContext(FrameFocusContext);

  useEffect(() => {
    if (textRef.current) textRef.current.rotation.y = Math.PI / 2;
  }, []);

  useEffect(() => {
    setTextVisible(targetFocus === 'frames' ? 1 : 0);
  }, [targetFocus]);

  return (
    <mesh
      name={name}
      scale={scale}
      position={position}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() =>  { document.body.style.cursor = 'auto'; }}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial map={texture} />
      <Text ref={textRef} position={[0, -1.5, 0]} scale={0.4} color="black" fillOpacity={textVisible}>
        {text}
      </Text>
    </mesh>
  );
}

// ── Main 3-D scene ────────────────────────────────────────────────────────────
function Scene({ setClicked }) {
  const room     = useGLTF('/3DModels/scene.gltf');
  const sceneRef = useRef();
  const { targetFocus, setTargetFocus } = useContext(FrameFocusContext);

  const handleClick = (event) => {
    switch (event.object.name) {
      case 'Window_Books_0':
        playPsClick();
        setTargetFocus('books');
        break;
      case 'frame0':
        playPsClick();
        if (targetFocus === 'frames') setClicked('frame0');
        setTargetFocus('frames');
        break;
      case 'frame1':
        playPsClick();
        if (targetFocus === 'frames') setClicked('frame1');
        setTargetFocus('frames');
        break;
      case 'frame2':
        playPsClick();
        if (targetFocus === 'frames') setClicked('frame2');
        setTargetFocus('frames');
        break;
      case 'frame3':
        playPsClick();
        if (targetFocus === 'frames') setClicked('frame3');
        setTargetFocus('frames');
        break;
      default:
        break;
    }
  };

  return (
    <group ref={sceneRef} onClick={handleClick}>
      <CameraControl target={targetFocus} />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <primitive rotation={[0, -Math.PI / 2, 0]} object={room.scene} scale={1} />
      <mesh scale={7.5} position={[0, 0, -11]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <FrameExperiences args={[1,1,1]}       scale={7.1}  name="frame1" position={[0,0,-10.7]}    imageUrl={JoelImg} />
      <FrameExperiences text="𝑅𝑒𝓈𝑒𝒶𝓇𝒸𝒽"    args={[0.1,2,2]}   name="frame1" position={[-7.1,0,2.5]}  imageUrl="/3DModels/textures/research_illustration.jpeg" />
      <FrameExperiences text="𝑳𝒆𝒂𝒅𝒆𝒓𝒔𝒉𝒊𝒑"   args={[0.1,2,2]}   name="frame2" position={[-7.1,0,0]}    imageUrl="/3DModels/textures/leadership_illustration.jpg" />
      <FrameExperiences                      args={[0.1,2,3.55]} name="frame0" position={[-7.1,2.5,0]}  imageUrl="/3DModels/textures/honors.jpeg" />
      <FrameExperiences text="Ìñ†êr¢µl†µrål" args={[0.1,2,2]}   name="frame3" position={[-7.1,0,-2.5]} imageUrl="/3DModels/textures/intercultural.jpg" />
    </group>
  );
}

// ── Animated intro text ───────────────────────────────────────────────────────
function AnimatedText() {
  const [spring, api] = useSpring(() => ({
    positionY: -3, scale: 0.5, opacity: 0,
    config: { mass: 1, tension: 180, friction: 16 },
  }));

  useEffect(() => {
    let active = true;
    (async () => {
      await api.start({ positionY: 1, scale: 1.5, opacity: 1 });
      if (!active) return;
      await new Promise(resolve => setTimeout(resolve, 3000));
      if (!active) return;
      await api.start({ positionY: 10, opacity: 0 });
    })();
    return () => { active = false; };
  }, [api]);

  return (
    <animated.group position-y={spring.positionY} scale={spring.scale}>
      <Text fontSize={5.5} color="brown" position={[0, -0.5, -3]}>
        𝔍𝔬𝔢𝔩
      </Text>
    </animated.group>
  );
}

// ── Help modal ────────────────────────────────────────────────────────────────
function HelpView({ handleClick }) {
  return (
    <div className="help-modal-dark">
      <div className="help-modal-dark__inner">
        <p className="help-modal-dark__eyebrow">Joel Tchouke · Portfolio</p>
        <h2 className="help-modal-dark__title">Navigation</h2>
        <hr className="help-modal-dark__rule" />
        <ul className="help-modal-dark__list">
          <li>
            <strong>Move the camera</strong>
            Click on objects or frames to direct the camera automatically.
          </li>
          <li>
            <strong>Focus a frame</strong>
            Click a wall frame once to move the camera toward it. Click again to open its detail page.
          </li>
          <li>
            <strong>Read documents</strong>
            Inside each detail page, use the document buttons to open PDF reflections inline.
          </li>
          <li>
            <strong>About Me</strong>
            Click the book on the table — use "← Back" to return to the scene.
          </li>
          <li>
            <strong>Main page</strong>
            Use "← Main" in the top bar to navigate back.
          </li>
        </ul>
        <button className="dark-popup__close" onClick={handleClick}>Got it</button>
      </div>
    </div>
  );
}

// ── Generic popup ─────────────────────────────────────────────────────────────
function GeneralPopUP({ header, description, click }) {
  return (
    <div className="dark-popup-overlay">
      <div className="dark-popup">
        <div className="dark-popup__header-row">
          <div>
            <p className="dark-popup__eyebrow">Joel Tchouke · Portfolio</p>
            <h2 className="dark-popup__title">{header}</h2>
          </div>
          <button className="dark-popup__x" onClick={click}>×</button>
        </div>
        <hr className="dark-popup__rule" />
        <p className="dark-popup__body">{description}</p>
        <button className="dark-popup__close" onClick={click}>Close</button>
      </div>
    </div>
  );
}

// ── Honor detail panels ───────────────────────────────────────────────────────
function Honors({ handleClick }) {
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">Honors · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← Return to Scene</button>
      </header>
      <div className="honors-page__content">
        <p className="honors-page__eyebrow">Competency Overview</p>
        <h1 className="honors-page__title">Honors<br />Program</h1>
        <hr className="honors-page__rule" />
        <p className="honors-page__description">
          Honors students are committed to developing in several competency areas such as leadership, research, and intercultural engagement. The program provides class experiences designed to support competency development and a variety of co-curricular activities to enrich their growth. Students demonstrate their emerging competencies through electronic portfolios in which they document their activities and engage in meaningful reflection about their learning. The Honors Program challenges students to move outside of their comfort zones and think critically about the world and their personal contributions to the communities in which they live.
        </p>
        <p className="honors-page__docs-label">Documents</p>
        <div className="honors-page__docs">
          <PDFReader path="/Experiences/honors375.pdf" name="Why Honors — 201" />
          <PDFReader path="/Experiences/honors375.pdf" name="Why Honors — 375" />
        </div>
      </div>
    </div>
  );
}

function Research({ handleClick }) {
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">Research · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← Return to Scene</button>
      </header>
      <div className="honors-page__content">
        <p className="honors-page__eyebrow">Competency Area</p>
        <h1 className="honors-page__title">Research</h1>
        <hr className="honors-page__rule" />
        <p className="honors-page__description">
          Honors students are committed to developing in several competency areas such as leadership, research, and intercultural engagement. The program provides class experiences designed to support competency development and a variety of co-curricular activities to enrich their growth. Students demonstrate their emerging competencies through electronic portfolios in which they document their activities and engage in meaningful reflection about their learning. The Honors Program challenges students to move outside of their comfort zones and to think critically about the world and their personal contributions to the communities in which they live.
        </p>
        <p className="honors-page__docs-label">Reflection</p>
        <div className="honors-page__docs">
          <PDFReader path="/Experiences/Research/Research.pdf" name="Research Reflection" />
        </div>
      </div>
    </div>
  );
}

function Leadership({ handleClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">Leadership · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← Return to Scene</button>
      </header>
      <div className="honors-page__content">
        <p className="honors-page__eyebrow">Competency Area</p>
        <h1 className="honors-page__title">Leadership</h1>
        <hr className="honors-page__rule" />
        <p className="honors-page__description">
          As a leader, I am committed to inspiring and empowering others to achieve their full potential. Through various leadership roles, including my involvement in student organizations and team-based projects, I have developed strong skills in guiding teams, fostering collaboration, and promoting positive change. I believe effective leadership involves active listening, clear communication, and creating an environment where everyone feels valued. Whether it's mentoring peers, leading group projects, or taking initiative in community activities, I strive to lead by example and encourage others to contribute their unique strengths.
        </p>
        <p className="honors-page__docs-label">Reflections &amp; Reports</p>
        <div className="honors-page__docs">
          <PDFReader path="/Experiences/Leadership/Leadership2.pdf" name="Leadership Reflection" />
          <PDFReader path="/Experiences/Leadership/Leadership.pdf" name="ISA / ASA Experience" />
          <button className="honors-doc-btn" onClick={() => setImageLoaded(true)}>
            Strength Finder Report
          </button>
        </div>
        {imageLoaded && (
          <img src={finder} alt="Strength Finder" className="honors-page__image" />
        )}
      </div>
    </div>
  );
}

function Intercultural({ handleClick }) {
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">Intercultural · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← Return to Scene</button>
      </header>
      <div className="honors-page__content">
        <p className="honors-page__eyebrow">Competency Area</p>
        <h1 className="honors-page__title">Intercultural<br />Engagement</h1>
        <hr className="honors-page__rule" />
        <p className="honors-page__description">
          I believe that engaging with diverse cultures enriches my personal growth and enhances my ability to work in global, multicultural environments. Throughout my academic and extracurricular activities, I have actively sought opportunities to interact with people from different cultural backgrounds. Whether through my involvement in international student organizations or my study abroad experiences, I have gained a deeper understanding of cultural differences, developed empathy, and improved my ability to communicate across cultural boundaries. I am dedicated to fostering inclusivity and promoting intercultural dialogue, which I believe are essential for creating a collaborative and harmonious environment.
        </p>
        <p className="honors-page__docs-label">Reflection</p>
        <div className="honors-page__docs">
          <PDFReader path="/Experiences/Intercultural/Intercultural.pdf" name="Intercultural Reflection" />
        </div>
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
function SceneThree({ onNavigate }) {
  const [targetFocus, setTargetFocus] = useState('origin');
  const [helpClick,   setHelpClick]   = useState(false);
  const [clicked,     setClicked]     = useState('');
  const [intro,       setIntro]       = useState(false);
  const [welcome,     setWelcome]     = useState(false);
  const [mission,     setMission]     = useState(false);

  const handlePdf = () => setClicked('');

  return (
    <FrameFocusContext.Provider value={{ targetFocus, setTargetFocus }}>
      <SceneLoader />

      <div className="App scene-root" style={{ background: '#050505' }}>

        {/* ── Top bar ── */}
        <header className="scene-topbar">
          <span className="scene-topbar__logo">TJ</span>
          <nav className="scene-topbar__nav">
            <button className="scene-nav-btn" onClick={() => { playPsClick(); setIntro(v => !v); }}>Introduction</button>
            <button className="scene-nav-btn" onClick={() => { playPsClick(); setWelcome(v => !v); }}>Welcome</button>
            <button className="scene-nav-btn" onClick={() => { playPsClick(); setMission(v => !v); }}>Mission</button>
            <button className="scene-nav-btn" onClick={() => { playPsClick(); setHelpClick(v => !v); }}>Help</button>
            {onNavigate && (
              <button className="scene-nav-btn scene-nav-btn--back" onClick={() => { playPsClick(); onNavigate('main'); }}>← Main</button>
            )}
          </nav>
        </header>

        {/* Exit camera focus */}
        {targetFocus !== 'origin' && (
          <button className="scene-exit-btn" onClick={() => { playPsClick(); setTargetFocus('origin'); }}>← Back</button>
        )}

        {helpClick   && <HelpView handleClick={() => setHelpClick(v => !v)} />}

        {clicked === 'frame0' && <Honors        handleClick={handlePdf} />}
        {clicked === 'frame1' && <Research      handleClick={handlePdf} />}
        {clicked === 'frame2' && <Leadership    handleClick={handlePdf} />}
        {clicked === 'frame3' && <Intercultural handleClick={handlePdf} />}

        {intro && (
          <GeneralPopUP
            header="Introduction"
            description="Welcome to my honors portfolio! My name is Joel Tchouke, and I am passionate about growing as a leader and using my skills to make a meaningful impact in the world. Through my journey as an honors student, I have worked to combine my knowledge of engineering with a strong desire to serve others and solve real-world problems. I believe that leadership is about inspiring and empowering people to reach their full potential, and I strive to grow in this area every day. Whether through collaborating on innovative projects, mentoring my peers, or taking on leadership roles in my community, I am committed to making a difference. This portfolio reflects my dedication to excellence and my vision of using both engineering and leadership to create a brighter future."
            click={() => setIntro(v => !v)}
          />
        )}
        {welcome && (
          <GeneralPopUP
            header="Welcome"
            description="Hello and welcome! I'm Joel Tchouke, and this portfolio is a reflection of my journey, growth, and accomplishments. Here, you'll find projects, experiences, and insights that showcase my passion for engineering, leadership, and making a positive impact in the world. Thank you for taking the time to explore my work. I hope it inspires you as much as the journey has inspired me."
            click={() => setWelcome(v => !v)}
          />
        )}
        {mission && (
          <GeneralPopUP
            header="Mission Statement"
            description="My mission is to use my skills in engineering and leadership to make a strong, positive impact in the environment around me. I am dedicated to solving real-world problems and creating solutions that not only advance technology but also improve the lives of those I work with. Through my studies and experiences, I strive to inspire others, empower my community, and contribute to a brighter future for all."
            click={() => setMission(v => !v)}
          />
        )}

        <Canvas>
          <Suspense fallback={null}>
            <Scene setClicked={setClicked} />
            <AnimatedText />
          </Suspense>
        </Canvas>

      </div>
    </FrameFocusContext.Provider>
  );
}

useGLTF.preload('/3DModels/scene.gltf');

export default SceneThree;
