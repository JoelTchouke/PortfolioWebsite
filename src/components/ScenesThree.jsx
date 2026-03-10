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

// ── Scene loader ──────────────────────────────────────────────────────────────
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
        fontFamily: "'Anton', 'Impact', sans-serif",
        fontSize: '6rem', fontWeight: 900,
        color: 'rgba(240,240,240,0.88)', lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {Math.round(progress)}
      </div>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.55rem',
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: 'rgba(240,240,240,0.32)', marginTop: '0.8rem',
      }}>
        LOADING GALLERY
      </div>
      <div style={{
        width: 180, height: 1,
        background: 'rgba(240,240,240,0.08)', marginTop: '2.4rem', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: '#b41c10',
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
    <button className="honors-doc-btn" onClick={() => setPdfLoaded(true)}>{name}</button>
  ) : (
    <div className="honors-page__pdf-wrap">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer fileUrl={path} plugins={[defaultLayout]} />
      </Worker>
    </div>
  );
};

// ── Camera control ────────────────────────────────────────────────────────────
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
function FrameExperiences({ position, scale, imageUrl, name, args, text, noFog, label, onHover }) {
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
      onPointerOver={() => { document.body.style.cursor = 'pointer'; onHover && onHover(label || null); }}
      onPointerOut={() =>  { document.body.style.cursor = 'auto';    onHover && onHover(null); }}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial map={texture} fog={!noFog} />
      <Text ref={textRef} position={[0, -1.5, 0]} scale={0.4} color="#e8e8e8" fillOpacity={textVisible}>
        {text}
      </Text>
    </mesh>
  );
}

// ── Main 3-D scene ────────────────────────────────────────────────────────────
function Scene({ setClicked, setHovered }) {
  const room     = useGLTF('/3DModels/scene.gltf');
  const sceneRef = useRef();
  const { scene } = useThree();
  const { targetFocus, setTargetFocus } = useContext(FrameFocusContext);

  // Subtle dark fog — only affects far background, not the room itself
  useEffect(() => {
    scene.fog = new THREE.Fog('#050505', 20, 45);
    scene.background = new THREE.Color('#111008');
    return () => { scene.fog = null; scene.background = null; };
  }, [scene]);

  const handleClick = (event) => {
    switch (event.object.name) {
      case 'Window_Books_0': setTargetFocus('books'); break;
      case 'frame0':
        if (targetFocus === 'frames') setClicked('frame0');
        setTargetFocus('frames'); break;
      case 'frame1':
        if (targetFocus === 'frames') setClicked('frame1');
        setTargetFocus('frames'); break;
      case 'frame2':
        if (targetFocus === 'frames') setClicked('frame2');
        setTargetFocus('frames'); break;
      case 'frame3':
        if (targetFocus === 'frames') setClicked('frame3');
        setTargetFocus('frames'); break;
      default: break;
    }
  };

  return (
    <group ref={sceneRef} onClick={handleClick}>
      <CameraControl target={targetFocus} />

      {/* Keep original lighting that worked — just tint it warmer/redder */}
      <ambientLight intensity={0.9} color="#ffe8d0" />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffd0a0" />

      {/* Red accent lights for mood */}
      <pointLight position={[-4, 3, 4]} intensity={1.5} color="#b41c10" distance={20} decay={2} />
      <pointLight position={[6, 2, -6]} intensity={0.8} color="#7a0e08" distance={16} decay={2} />

      {/* Spotlight on portrait */}
      <spotLight
        position={[0, 7, 3]}
        intensity={2}
        color="#ffe0b0"
        angle={0.4}
        penumbra={0.6}
        distance={20}
        decay={2}
      />

      <primitive rotation={[0, -Math.PI / 2, 0]} object={room.scene} scale={1} />
      <mesh scale={7.5} position={[0, 0, -11]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#080808" />
      </mesh>
      <FrameExperiences args={[1,1,1]}       scale={7.1}  name="frame1" position={[0,0,-10.7]}    imageUrl={JoelImg} />
      <FrameExperiences text="Research"      args={[0.1,2,2]}   name="frame1" position={[-7.1,0,2.5]}  imageUrl="/3DModels/textures/research_illustration.jpeg"  label="Research"                onHover={setHovered} />
      <FrameExperiences text="Leadership"    args={[0.1,2,2]}   name="frame2" position={[-7.1,0,0]}    imageUrl="/3DModels/textures/leadership_illustration.jpg" label="Leadership"               onHover={setHovered} />
      <FrameExperiences                      args={[0.1,2,3.55]} name="frame0" position={[-7.1,2.5,0]}  imageUrl="/3DModels/textures/honors.jpeg"                  label="Honors Program"          onHover={setHovered} />
      <FrameExperiences text="Intercultural" args={[0.1,2,2]}   name="frame3" position={[-7.1,0,-2.5]} imageUrl="/3DModels/textures/intercultural.jpg"            label="Intercultural Engagement" onHover={setHovered} />
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
      <Text fontSize={5.5} color="#b41c10" position={[0, -0.5, -3]}>𝔍𝔬𝔢𝔩</Text>
    </animated.group>
  );
}

// ── Help modal ────────────────────────────────────────────────────────────────
function HelpView({ handleClick }) {
  return (
    <div className="honors-overlay">
      <div className="honors-modal">
        <p className="honors-modal__eyebrow">// navigation</p>
        <h2 className="honors-modal__title">HOW TO<br />EXPLORE.</h2>
        <hr className="honors-modal__rule" />
        <ul className="honors-modal__list">
          <li><span className="honors-modal__key">Click a frame</span>Camera moves toward it. Click again to open its detail panel.</li>
          <li><span className="honors-modal__key">← Back</span>Returns camera to origin view.</li>
          <li><span className="honors-modal__key">Documents</span>Open PDF reflections inline from each detail panel.</li>
          <li><span className="honors-modal__key">Books on desk</span>Click to zoom into the desk area.</li>
        </ul>
        <button className="honors-modal__btn" onClick={handleClick}>GOT IT</button>
      </div>
    </div>
  );
}

// ── Generic popup ─────────────────────────────────────────────────────────────
function GeneralPopUP({ header, description, click }) {
  return (
    <div className="honors-overlay">
      <div className="honors-modal">
        <p className="honors-modal__eyebrow">// joel tchouke</p>
        <h2 className="honors-modal__title">{header.toUpperCase()}.</h2>
        <hr className="honors-modal__rule" />
        <p className="honors-modal__body">{description}</p>
        <button className="honors-modal__btn" onClick={click}>CLOSE</button>
      </div>
    </div>
  );
}

// ── Detail panels — centered layout ──────────────────────────────────────────
function Honors({ handleClick }) {
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">// Honors · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← SCENE</button>
      </header>
      <div className="honors-page__content">
        <p className="honors-page__eyebrow">Competency Overview</p>
        <h1 className="honors-page__title">HONORS<br />PROGRAM.</h1>
        <hr className="honors-page__rule" />
        <p className="honors-page__description">
          Honors students are committed to developing in several competency areas such as leadership, research, and intercultural engagement. The program provides class experiences designed to support competency development and a variety of co-curricular activities to enrich their growth.
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
        <span className="honors-page__breadcrumb">// Research · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← SCENE</button>
      </header>
      <div className="honors-page__content">
        <p className="honors-page__eyebrow">Competency Area</p>
        <h1 className="honors-page__title">RESEARCH.</h1>
        <hr className="honors-page__rule" />
        <p className="honors-page__description">
          Honors students are committed to developing in several competency areas such as leadership, research, and intercultural engagement. Students demonstrate their emerging competencies through electronic portfolios in which they document their activities and engage in meaningful reflection about their learning.
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
        <span className="honors-page__breadcrumb">// Leadership · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← SCENE</button>
      </header>
      <div className="honors-page__content">
        <p className="honors-page__eyebrow">Competency Area</p>
        <h1 className="honors-page__title">LEADERSHIP.</h1>
        <hr className="honors-page__rule" />
        <p className="honors-page__description">
          As a leader, I am committed to inspiring and empowering others to achieve their full potential. Through various leadership roles, I have developed strong skills in guiding teams, fostering collaboration, and promoting positive change.
        </p>
        <p className="honors-page__docs-label">Reflections &amp; Reports</p>
        <div className="honors-page__docs">
          <PDFReader path="/Experiences/Leadership/Leadership2.pdf" name="Leadership Reflection" />
          <PDFReader path="/Experiences/Leadership/Leadership.pdf" name="ISA / ASA Experience" />
          <button className="honors-doc-btn" onClick={() => setImageLoaded(true)}>Strength Finder Report</button>
        </div>
        {imageLoaded && <img src={finder} alt="Strength Finder" className="honors-page__image" />}
      </div>
    </div>
  );
}

function Intercultural({ handleClick }) {
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">// Intercultural · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← SCENE</button>
      </header>
      <div className="honors-page__content">
        <p className="honors-page__eyebrow">Competency Area</p>
        <h1 className="honors-page__title">INTERCULTURAL<br />ENGAGEMENT.</h1>
        <hr className="honors-page__rule" />
        <p className="honors-page__description">
          I believe that engaging with diverse cultures enriches my personal growth and enhances my ability to work in global, multicultural environments. I have actively sought opportunities to interact with people from different cultural backgrounds, gaining deeper understanding and empathy.
        </p>
        <p className="honors-page__docs-label">Reflection</p>
        <div className="honors-page__docs">
          <PDFReader path="/Experiences/Intercultural/Intercultural.pdf" name="Intercultural Reflection" />
        </div>
      </div>
    </div>
  );
}

// ── Mobile gate ───────────────────────────────────────────────────────────────
function MobileGate({ onNavigate }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.3)', marginBottom: '1.4rem' }}>// Joel Tchouke · Honors</p>
      <h1 style={{ fontFamily: "'Anton', 'Impact', sans-serif", fontSize: 'clamp(3rem,12vw,5rem)', fontWeight: 900, color: 'rgba(240,240,240,0.9)', margin: '0 0 1.6rem', lineHeight: 0.9, textTransform: 'uppercase' }}>DESKTOP<br />ONLY.</h1>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(240,240,240,0.08)', width: '100%', maxWidth: 320, margin: '0 0 1.8rem' }} />
      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', lineHeight: 1.8, color: 'rgba(240,240,240,0.4)', maxWidth: 320, margin: '0 0 2.4rem' }}>This experience requires a desktop browser.</p>
      {onNavigate && (
        <button onClick={() => onNavigate('main')} style={{ background: '#b41c10', border: 'none', fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,240,240,0.95)', cursor: 'pointer', padding: '0.7rem 1.6rem' }}>
          ← BACK TO MAIN
        </button>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function SceneThree({ onNavigate }) {
  const [targetFocus, setTargetFocus] = useState('origin');
  const [helpClick,   setHelpClick]   = useState(false);
  const [clicked,     setClicked]     = useState('');
  const [intro,       setIntro]       = useState(false);
  const [welcome,     setWelcome]     = useState(false);
  const [mission,     setMission]     = useState(false);
  const [hovered,     setHovered]     = useState(null);
  const [mousePos,    setMousePos]    = useState({ x: 0, y: 0 });

  // if books are focused, jump to about section with special flag
  useEffect(() => {
    if (targetFocus === 'books' && onNavigate) {
      onNavigate('about', { fromHonors: true });
      // clear focus so the effect doesn't fire repeatedly if onNavigate prop changes
      setTargetFocus('origin');
    }
  }, [targetFocus, onNavigate]);

  useEffect(() => {
    const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const isMobile = window.innerWidth < 768;
  const handlePdf = () => setClicked('');

  if (isMobile) return <MobileGate onNavigate={onNavigate} />;

  return (
    <FrameFocusContext.Provider value={{ targetFocus, setTargetFocus }}>
      <SceneLoader />
      <div className="App scene-root" style={{ background: '#050505' }}>

        <header className="scene-topbar">
          <div className="scene-topbar__left">
            <div className="scene-topbar__logo">TJ</div>
            <span className="scene-topbar__title">HONORS</span>
          </div>
          <nav className="scene-topbar__nav">
            <span className="scene-topbar__bracket">[</span>
            <button className="scene-nav-btn" onClick={() => setIntro(v => !v)}>INTRO</button>
            <button className="scene-nav-btn" onClick={() => setWelcome(v => !v)}>WELCOME</button>
            <button className="scene-nav-btn" onClick={() => setMission(v => !v)}>MISSION</button>
            <button className="scene-nav-btn" onClick={() => setHelpClick(v => !v)}>HELP</button>
            {onNavigate && (
              <button className="scene-nav-btn scene-nav-btn--back" onClick={() => onNavigate('main')}>← MAIN</button>
            )}
            <span className="scene-topbar__bracket">]</span>
          </nav>
        </header>

        {targetFocus !== 'origin' && (
          <button className="scene-exit-btn" onClick={() => setTargetFocus('origin')}>← BACK</button>
        )}

        {helpClick            && <HelpView handleClick={() => setHelpClick(v => !v)} />}
        {clicked === 'frame0' && <Honors        handleClick={handlePdf} />}
        {clicked === 'frame1' && <Research      handleClick={handlePdf} />}
        {clicked === 'frame2' && <Leadership    handleClick={handlePdf} />}
        {clicked === 'frame3' && <Intercultural handleClick={handlePdf} />}

        {intro   && <GeneralPopUP header="Introduction"    description="Welcome to my honors portfolio. My name is Joel Tchouke, and I am passionate about growing as a leader and using my skills to make a meaningful impact in the world. Through my journey as an honors student, I have worked to combine my knowledge of engineering with a strong desire to serve others and solve real-world problems." click={() => setIntro(v => !v)} />}
        {welcome && <GeneralPopUP header="Welcome"         description="Hello and welcome. I'm Joel Tchouke, and this portfolio is a reflection of my journey, growth, and accomplishments. Here you'll find projects, experiences, and insights that showcase my passion for engineering, leadership, and making a positive impact." click={() => setWelcome(v => !v)} />}
        {mission && <GeneralPopUP header="Mission Statement" description="My mission is to use my skills in engineering and leadership to make a strong, positive impact in the environment around me. I am dedicated to solving real-world problems and creating solutions that not only advance technology but also improve the lives of those I work with." click={() => setMission(v => !v)} />}

        <Canvas dpr={[1, 1.5]} performance={{ min: 0.5 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
          <Suspense fallback={null}>
            <Scene setClicked={setClicked} setHovered={setHovered} />
            <AnimatedText />
          </Suspense>
        </Canvas>

        <div className="scene-hint">
          <span className="scene-hint__line" />
          <span className="scene-hint__text">CLICK FRAMES TO EXPLORE</span>
          <span className="scene-hint__line" />
        </div>

        {hovered && (
          <div className="scene-tooltip" style={{ left: mousePos.x + 18, top: mousePos.y - 10 }}>
            {hovered.toUpperCase()}
          </div>
        )}
      </div>
    </FrameFocusContext.Provider>
  );
}

useGLTF.preload('/3DModels/scene.gltf');
export default SceneThree;