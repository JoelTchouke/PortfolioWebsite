import { createContext, useContext, useEffect, useRef, useState, Suspense } from 'react';
import '../App.css';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text, useProgress } from '@react-three/drei';
import '../css/honorScene.css';
import { useSpring, animated } from '@react-spring/three';
import JoelImg from '../img/joelG.PNG';
import * as THREE from 'three';
import finder from '../img/finder.png';

const FrameFocusContext = createContext();

// ══════════════════════════════════════════════════════════════════
//  ARTIFACTS — add your files here per section
//
//  type: 'image' | 'pdf' | 'video'
//
//  image: { type:'image', label:'...', path:'/Experiences/...jpg', thumb:'/Experiences/...jpg' }
//  pdf:   { type:'pdf',   label:'...', path:'/Experiences/...pdf', thumb: null }
//  video: { type:'video', label:'...', path:'/Experiences/...mp4', thumb: null }
//         (video also accepts YouTube: path:'https://www.youtube.com/embed/VIDEO_ID')
// ══════════════════════════════════════════════════════════════════
const ARTIFACTS = {
  honors: [
    { type: 'pdf',   label: 'Why Honors — 201', path: '/Experiences/honors201.pdf',   thumb: null },
    { type: 'pdf',   label: 'Why Honors — 375', path: '/Experiences/honors375.pdf',   thumb: null },
  ],
  research: [
    { type: 'pdf',   label: 'Research Reflection', path: '/Experiences/Research/Research.pdf', thumb: null },
  ],
  leadership: [
    { type: 'pdf',   label: 'Leadership Reflection',  path: '/Experiences/Leadership/Leadership2.pdf', thumb: null },
    { type: 'pdf',   label: 'ISA / ASA Experience',   path: '/Experiences/Leadership/Leadership.pdf',  thumb: null },
    { type: 'image', label: 'Strength Finder Report', path: finder, thumb: finder },
  ],
  intercultural: [
    { type: 'pdf',   label: 'Intercultural Reflection', path: '/Experiences/Intercultural/Intercultural.pdf', thumb: null },
  ],
};

// ── Scene loader ──────────────────────────────────────────────────
function SceneLoader() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <div style={{ position:'fixed',inset:0,zIndex:9000,background:'#050505',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
      <div style={{ fontFamily:"'Anton','Impact',sans-serif",fontSize:'6rem',fontWeight:900,color:'rgba(240,240,240,0.88)',lineHeight:1,letterSpacing:'-0.02em' }}>
        {Math.round(progress)}
      </div>
      <div style={{ fontFamily:"'Space Mono',monospace",fontSize:'0.55rem',letterSpacing:'0.22em',textTransform:'uppercase',color:'rgba(240,240,240,0.32)',marginTop:'0.8rem' }}>
        LOADING GALLERY
      </div>
      <div style={{ width:180,height:1,background:'rgba(240,240,240,0.08)',marginTop:'2.4rem',overflow:'hidden' }}>
        <div style={{ height:'100%',background:'#b41c10',width:`${progress}%`,transition:'width 0.15s linear' }} />
      </div>
    </div>
  );
}

// ── Type icons ────────────────────────────────────────────────────
const PDFIcon = () => (
  <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:36,height:44}}>
    <rect x="1" y="1" width="30" height="42" rx="2" stroke="rgba(240,240,240,0.2)" strokeWidth="1.5"/>
    <path d="M9 1v12h22" stroke="rgba(240,240,240,0.2)" strokeWidth="1.5" fill="none"/>
    <line x1="7" y1="22" x2="25" y2="22" stroke="#b41c10" strokeWidth="1.5"/>
    <line x1="7" y1="28" x2="25" y2="28" stroke="rgba(240,240,240,0.15)" strokeWidth="1.5"/>
    <line x1="7" y1="34" x2="18" y2="34" stroke="rgba(240,240,240,0.15)" strokeWidth="1.5"/>
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:40,height:40}}>
    <rect x="1" y="8" width="34" height="32" rx="3" stroke="rgba(240,240,240,0.2)" strokeWidth="1.5"/>
    <path d="M35 18l11-8v28l-11-8V18z" stroke="rgba(240,240,240,0.2)" strokeWidth="1.5" fill="none"/>
    <circle cx="17" cy="24" r="7" stroke="rgba(240,240,240,0.12)" strokeWidth="1"/>
    <path d="M14 21l7 3-7 3V21z" fill="#b41c10"/>
  </svg>
);

// ── Lightbox ──────────────────────────────────────────────────────
function Lightbox({ items, startIndex, onClose }) {
  const [idx, setIdx]     = useState(startIndex);
  const [loaded, setLoaded] = useState(false);
  const item = items[idx];
  const isYT = item.type === 'video' && item.path.includes('youtube.com');

  useEffect(() => { setLoaded(false); }, [idx]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowRight')  setIdx(i => Math.min(i + 1, items.length - 1));
      if (e.key === 'ArrowLeft')   setIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items, onClose]);

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="lb-header">
          <span className="lb-counter">{idx + 1} / {items.length}</span>
          <span className="lb-title">{item.label}</span>
          <button className="lb-close" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="lb-content">
          {!loaded && <div className="lb-loading"><span/><span/><span/></div>}

          {item.type === 'image' && (
            <img src={item.path} alt={item.label} className="lb-image"
              style={{ opacity: loaded ? 1 : 0 }} onLoad={() => setLoaded(true)} />
          )}

          {item.type === 'pdf' && (
            <iframe src={item.path} title={item.label} className="lb-iframe"
              style={{ opacity: loaded ? 1 : 0 }} onLoad={() => setLoaded(true)} />
          )}

          {item.type === 'video' && isYT && (
            <iframe src={item.path} title={item.label} className="lb-iframe lb-iframe--video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen style={{ opacity: loaded ? 1 : 0 }} onLoad={() => setLoaded(true)} />
          )}

          {item.type === 'video' && !isYT && (
            <video src={item.path} className="lb-video" controls autoPlay
              style={{ opacity: loaded ? 1 : 0 }} onCanPlay={() => setLoaded(true)} />
          )}
        </div>

        {/* Navigation arrows */}
        {items.length > 1 && (
          <div className="lb-nav">
            <button className="lb-nav__btn" onClick={() => setIdx(i => Math.max(i-1,0))} disabled={idx===0}>←</button>
            <div className="lb-dots">
              {items.map((_, i) => (
                <button key={i} className={`lb-dot${i===idx?' lb-dot--active':''}`} onClick={() => setIdx(i)} />
              ))}
            </div>
            <button className="lb-nav__btn" onClick={() => setIdx(i => Math.min(i+1,items.length-1))} disabled={idx===items.length-1}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Artifact gallery ──────────────────────────────────────────────
function ArtifactGallery({ items }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex,   setStartIndex]   = useState(0);

  if (!items || items.length === 0) return null;

  const open = (i) => { setStartIndex(i); setLightboxOpen(true); };

  return (
    <>
      <div className="ag-grid">
        {items.map((item, i) => (
          <div key={i} className={`ag-card ag-card--${item.type}`} onClick={() => open(i)}>

            {/* Thumb */}
            <div className="ag-card__thumb">
              {item.type === 'image' && item.thumb
                ? <img src={item.thumb} alt={item.label} />
                : item.type === 'video'
                  ? <><VideoIcon /><span className="ag-card__play">▶</span></>
                  : <PDFIcon />
              }
              {/* Hover reveal */}
              <div className="ag-card__reveal">
                <span className="ag-card__reveal-text">OPEN</span>
              </div>
            </div>

            {/* Footer */}
            <div className="ag-card__footer">
              <span className="ag-card__label">{item.label}</span>
              <span className={`ag-card__badge ag-card__badge--${item.type}`}>
                {item.type.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <Lightbox items={items} startIndex={startIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}

// ── Camera control ────────────────────────────────────────────────
function CameraControl({ target }) {
  const { camera } = useThree();
  const tp = useRef(new THREE.Vector3(0,0,8));
  const tl = useRef(new THREE.Vector3(0,0,0));
  const cl = useRef(new THREE.Vector3(0,0,0));
  useEffect(() => {
    if (target==='frames') { tp.current.set(-1,0,0); tl.current.set(-5,0,0); }
    else if (target==='books') { tp.current.set(-2,-1,5); tl.current.set(0,0,0); }
    else { tp.current.set(0,0,8); tl.current.set(0,0,0); }
  }, [target]);
  useFrame(() => {
    camera.position.lerp(tp.current, 0.05);
    cl.current.lerp(tl.current, 0.05);
    camera.lookAt(cl.current);
  });
  return <OrbitControls enablePan={false} enableZoom={false} />;
}

// ── Frame mesh ────────────────────────────────────────────────────
function FrameExperiences({ position, scale, imageUrl, name, args, text, label, onHover }) {
  const textRef = useRef();
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  const [tv, setTv] = useState(0);
  const { targetFocus } = useContext(FrameFocusContext);
  useEffect(() => { if (textRef.current) textRef.current.rotation.y = Math.PI/2; }, []);
  useEffect(() => { setTv(targetFocus==='frames'?1:0); }, [targetFocus]);
  return (
    <mesh name={name} scale={scale} position={position}
      onPointerOver={() => { document.body.style.cursor='pointer'; onHover&&onHover(label||null); }}
      onPointerOut={()  => { document.body.style.cursor='auto';    onHover&&onHover(null); }}>
      <boxGeometry args={args}/>
      <meshStandardMaterial map={texture}/>
      <Text ref={textRef} position={[0,-1.5,0]} scale={0.4} color="#e8e8e8" fillOpacity={tv}>{text}</Text>
    </mesh>
  );
}

// ── Scene ─────────────────────────────────────────────────────────
function Scene({ setClicked, setHovered }) {
  const room = useGLTF('/3DModels/scene.gltf');
  const { scene } = useThree();
  const { targetFocus, setTargetFocus } = useContext(FrameFocusContext);
  useEffect(() => {
    scene.fog = new THREE.Fog('#050505', 20, 45);
    scene.background = new THREE.Color('#111008');
    return () => { scene.fog=null; scene.background=null; };
  }, [scene]);
  const handleClick = (e) => {
    switch(e.object.name) {
      case 'Window_Books_0': setTargetFocus('books'); break;
      case 'frame0': if(targetFocus==='frames') setClicked('frame0'); setTargetFocus('frames'); break;
      case 'frame1': if(targetFocus==='frames') setClicked('frame1'); setTargetFocus('frames'); break;
      case 'frame2': if(targetFocus==='frames') setClicked('frame2'); setTargetFocus('frames'); break;
      case 'frame3': if(targetFocus==='frames') setClicked('frame3'); setTargetFocus('frames'); break;
      default: break;
    }
  };
  return (
    <group onClick={handleClick}>
      <CameraControl target={targetFocus}/>
      <ambientLight intensity={0.9} color="#ffe8d0"/>
      <directionalLight position={[5,5,5]} intensity={0.8} color="#ffd0a0"/>
      <pointLight position={[-4,3,4]} intensity={1.5} color="#b41c10" distance={20} decay={2}/>
      <pointLight position={[6,2,-6]} intensity={0.8} color="#7a0e08" distance={16} decay={2}/>
      <spotLight position={[0,7,3]} intensity={2} color="#ffe0b0" angle={0.4} penumbra={0.6} distance={20} decay={2}/>
      <primitive rotation={[0,-Math.PI/2,0]} object={room.scene} scale={1}/>
      <mesh scale={7.5} position={[0,0,-11]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#080808"/></mesh>
      <FrameExperiences args={[1,1,1]}       scale={7.1}   name="frame1" position={[0,0,-10.7]}    imageUrl={JoelImg}/>
      <FrameExperiences text="Research"      args={[0.1,2,2]}    name="frame1" position={[-7.1,0,2.5]}  imageUrl="/3DModels/textures/research_illustration.jpeg"  label="Research"                onHover={setHovered}/>
      <FrameExperiences text="Leadership"    args={[0.1,2,2]}    name="frame2" position={[-7.1,0,0]}    imageUrl="/3DModels/textures/leadership_illustration.jpg" label="Leadership"               onHover={setHovered}/>
      <FrameExperiences                      args={[0.1,2,3.55]} name="frame0" position={[-7.1,2.5,0]}  imageUrl="/3DModels/textures/honors.jpeg"                 label="Honors Program"          onHover={setHovered}/>
      <FrameExperiences text="Intercultural" args={[0.1,2,2]}    name="frame3" position={[-7.1,0,-2.5]} imageUrl="/3DModels/textures/intercultural.jpg"           label="Intercultural Engagement" onHover={setHovered}/>
    </group>
  );
}

// ── AnimatedText ──────────────────────────────────────────────────
function AnimatedText() {
  const [spring, api] = useSpring(() => ({ positionY:-3,scale:0.5,opacity:0,config:{mass:1,tension:180,friction:16} }));
  useEffect(() => {
    let a=true;
    (async()=>{
      await api.start({positionY:1,scale:1.5,opacity:1});
      if(!a) return;
      await new Promise(r=>setTimeout(r,3000));
      if(!a) return;
      await api.start({positionY:10,opacity:0});
    })();
    return ()=>{a=false;};
  }, [api]);
  return (
    <animated.group position-y={spring.positionY} scale={spring.scale}>
      <Text fontSize={5.5} color="#b41c10" position={[0,-0.5,-3]}>{"𝔍𝔬𝔢𝔩"}</Text>
    </animated.group>
  );
}

// ── Modals ────────────────────────────────────────────────────────
function HelpView({ handleClick }) {
  return (
    <div className="honors-overlay"><div className="honors-modal">
      <p className="honors-modal__eyebrow">// navigation</p>
      <h2 className="honors-modal__title">HOW TO<br />EXPLORE.</h2>
      <hr className="honors-modal__rule"/>
      <ul className="honors-modal__list">
        <li><span className="honors-modal__key">Click a frame</span>Camera moves toward it. Click again to open detail panel.</li>
        <li><span className="honors-modal__key">← Back</span>Returns camera to origin view.</li>
        <li><span className="honors-modal__key">Artifacts</span>Click any card to open full screen. Arrow keys to navigate.</li>
      </ul>
      <button className="honors-modal__btn" onClick={handleClick}>GOT IT</button>
    </div></div>
  );
}
function GeneralPopUP({ header, description, click }) {
  return (
    <div className="honors-overlay"><div className="honors-modal">
      <p className="honors-modal__eyebrow">// joel tchouke</p>
      <h2 className="honors-modal__title">{header.toUpperCase()}.</h2>
      <hr className="honors-modal__rule"/>
      <p className="honors-modal__body">{description}</p>
      <button className="honors-modal__btn" onClick={click}>CLOSE</button>
    </div></div>
  );
}

// ── Detail page template ──────────────────────────────────────────
function DetailPage({ title, eyebrow, description, artifactKey, handleClick }) {
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">// {title} · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← SCENE</button>
      </header>
      <div className="honors-page__content">
        <p className="honors-page__eyebrow">{eyebrow}</p>
        <h1 className="honors-page__title">{title.toUpperCase()}.</h1>
        <hr className="honors-page__rule"/>
        <p className="honors-page__description">{description}</p>
        <p className="honors-page__docs-label">Artifacts</p>
        <ArtifactGallery items={ARTIFACTS[artifactKey]}/>
      </div>
    </div>
  );
}

const Honors        = ({handleClick}) => <DetailPage title="Honors Program"          eyebrow="Competency Overview" artifactKey="honors"        handleClick={handleClick} description="Honors students are committed to developing in several competency areas such as leadership, research, and intercultural engagement. The program provides class experiences designed to support competency development and a variety of co-curricular activities to enrich their growth."/>;
const Research      = ({handleClick}) => <DetailPage title="Research"                eyebrow="Competency Area"     artifactKey="research"      handleClick={handleClick} description="Honors students demonstrate their emerging competencies through electronic portfolios in which they document their activities and engage in meaningful reflection about their learning."/>;
const Leadership    = ({handleClick}) => <DetailPage title="Leadership"              eyebrow="Competency Area"     artifactKey="leadership"    handleClick={handleClick} description="As a leader, I am committed to inspiring and empowering others to achieve their full potential. Through various leadership roles, I have developed strong skills in guiding teams, fostering collaboration, and promoting positive change."/>;
const Intercultural = ({handleClick}) => <DetailPage title="Intercultural Engagement" eyebrow="Competency Area"   artifactKey="intercultural" handleClick={handleClick} description="I believe that engaging with diverse cultures enriches my personal growth and enhances my ability to work in global, multicultural environments. I have actively sought opportunities to interact with people from different cultural backgrounds."/>;

// ── Mobile gate ───────────────────────────────────────────────────
function MobileGate({ onNavigate }) {
  return (
    <div style={{position:'fixed',inset:0,background:'#050505',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center'}}>
      <p style={{fontFamily:"'Space Mono',monospace",fontSize:'0.55rem',letterSpacing:'0.22em',textTransform:'uppercase',color:'rgba(240,240,240,0.3)',marginBottom:'1.4rem'}}>// Joel Tchouke · Honors</p>
      <h1 style={{fontFamily:"'Anton','Impact',sans-serif",fontSize:'clamp(3rem,12vw,5rem)',fontWeight:900,color:'rgba(240,240,240,0.9)',margin:'0 0 1.6rem',lineHeight:0.9,textTransform:'uppercase'}}>DESKTOP<br/>ONLY.</h1>
      <hr style={{border:'none',borderTop:'1px solid rgba(240,240,240,0.08)',width:'100%',maxWidth:320,margin:'0 0 1.8rem'}}/>
      <p style={{fontFamily:"'Space Mono',monospace",fontSize:'0.78rem',lineHeight:1.8,color:'rgba(240,240,240,0.4)',maxWidth:320,margin:'0 0 2.4rem'}}>This experience requires a desktop browser.</p>
      {onNavigate && <button onClick={()=>onNavigate('main')} style={{background:'#b41c10',border:'none',fontFamily:"'Space Mono',monospace",fontSize:'0.62rem',letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(240,240,240,0.95)',cursor:'pointer',padding:'0.7rem 1.6rem'}}>← BACK TO MAIN</button>}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────
function SceneThree({ onNavigate }) {
  const [targetFocus, setTargetFocus] = useState('origin');
  const [helpClick,setHelpClick]   = useState(false);
  const [clicked,setClicked]       = useState('');
  const [intro,setIntro]           = useState(false);
  const [welcome,setWelcome]       = useState(false);
  const [mission,setMission]       = useState(false);
  const [hovered,setHovered]       = useState(null);
  const [mousePos,setMousePos]     = useState({x:0,y:0});

  useEffect(() => {
    if (targetFocus==='books' && onNavigate) { onNavigate('about',{fromHonors:true}); setTargetFocus('origin'); }
  }, [targetFocus, onNavigate]);

  useEffect(() => {
    const m = (e) => setMousePos({x:e.clientX,y:e.clientY});
    window.addEventListener('mousemove',m);
    return ()=>window.removeEventListener('mousemove',m);
  }, []);

  if (window.innerWidth < 768) return <MobileGate onNavigate={onNavigate}/>;
  const close = () => setClicked('');

  return (
    <FrameFocusContext.Provider value={{targetFocus,setTargetFocus}}>
      <SceneLoader/>
      <div className="App scene-root" style={{background:'#050505'}}>
        <header className="scene-topbar">
          <div className="scene-topbar__left">
            <div className="scene-topbar__logo">TJ</div>
            <span className="scene-topbar__title">HONORS</span>
          </div>
          <nav className="scene-topbar__nav">
            <span className="scene-topbar__bracket">[</span>
            <button className="scene-nav-btn" onClick={()=>setIntro(v=>!v)}>INTRO</button>
            <button className="scene-nav-btn" onClick={()=>setWelcome(v=>!v)}>WELCOME</button>
            <button className="scene-nav-btn" onClick={()=>setMission(v=>!v)}>MISSION</button>
            <button className="scene-nav-btn" onClick={()=>setHelpClick(v=>!v)}>HELP</button>
            {onNavigate && <button className="scene-nav-btn scene-nav-btn--back" onClick={()=>onNavigate('main')}>← MAIN</button>}
            <span className="scene-topbar__bracket">]</span>
          </nav>
        </header>

        {targetFocus!=='origin' && <button className="scene-exit-btn" onClick={()=>setTargetFocus('origin')}>← BACK</button>}

        {helpClick            && <HelpView handleClick={()=>setHelpClick(v=>!v)}/>}
        {clicked==='frame0'   && <Honors        handleClick={close}/>}
        {clicked==='frame1'   && <Research      handleClick={close}/>}
        {clicked==='frame2'   && <Leadership    handleClick={close}/>}
        {clicked==='frame3'   && <Intercultural handleClick={close}/>}

        {intro   && <GeneralPopUP header="Introduction"     description="Welcome to my honors portfolio. My name is Joel Tchouke, and I am passionate about growing as a leader and using my skills to make a meaningful impact in the world. Through my journey as an honors student, I have worked to combine my knowledge of engineering with a strong desire to serve others and solve real-world problems." click={()=>setIntro(v=>!v)}/>}
        {welcome && <GeneralPopUP header="Welcome"          description="Hello and welcome. I'm Joel Tchouke, and this portfolio is a reflection of my journey, growth, and accomplishments. Here you'll find projects, experiences, and insights that showcase my passion for engineering, leadership, and making a positive impact." click={()=>setWelcome(v=>!v)}/>}
        {mission && <GeneralPopUP header="Mission Statement" description="My mission is to use my skills in engineering and leadership to make a strong, positive impact in the environment around me. I am dedicated to solving real-world problems and creating solutions that not only advance technology but also improve the lives of those I work with." click={()=>setMission(v=>!v)}/>}

        <Canvas dpr={[1,1.5]} performance={{min:0.5}} gl={{antialias:true,powerPreference:'high-performance'}}>
          <Suspense fallback={null}>
            <Scene setClicked={setClicked} setHovered={setHovered}/>
            <AnimatedText/>
          </Suspense>
        </Canvas>

        <div className="scene-hint">
          <span className="scene-hint__line"/>
          <span className="scene-hint__text">CLICK FRAMES TO EXPLORE</span>
          <span className="scene-hint__line"/>
        </div>

        {hovered && <div className="scene-tooltip" style={{left:mousePos.x+18,top:mousePos.y-10}}>{hovered.toUpperCase()}</div>}
      </div>
    </FrameFocusContext.Provider>
  );
}

useGLTF.preload('/3DModels/scene.gltf');
export default SceneThree;