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

// ══════════════════════════════════════════════════════════════════
//  GALLERY — master visual archive
//  To add a real file: set path/thumb and placeholder:false
//  Leave placeholder:true + note until the file is ready
// ══════════════════════════════════════════════════════════════════
const GALLERY_ITEMS = [
  // ── Photos ────────────────────────────────────────────────────────
  { type:'image', category:'photos',       label:'Portrait',                path:JoelImg, thumb:JoelImg, placeholder:false },
  { type:'image', category:'photos',       label:'Professional Headshot',   path:null,    thumb:null,    placeholder:true,  note:'Upload a high-resolution professional headshot' },
  { type:'image', category:'photos',       label:'Campus Life',             path:null,    thumb:null,    placeholder:true,  note:'Campus activity photos — events, classes, daily life' },
  // ── Events ────────────────────────────────────────────────────────
  { type:'image', category:'events',       label:'ISA / ASA Event',         path:null,    thumb:null,    placeholder:true,  note:'Photos from ISA or ASA meetings and events' },
  { type:'image', category:'events',       label:'Honors Ceremony',         path:null,    thumb:null,    placeholder:true,  note:'Honors induction or awards ceremony' },
  { type:'image', category:'events',       label:'Volunteer Activity',      path:null,    thumb:null,    placeholder:true,  note:'Community service or volunteer event photos' },
  // ── Documents ─────────────────────────────────────────────────────
  { type:'pdf',   category:'documents',    label:'Why Honors — 201',        path:'/Experiences/honors201.pdf',                    thumb:null, placeholder:false },
  { type:'pdf',   category:'documents',    label:'Why Honors — 375',        path:'/Experiences/honors375.pdf',                    thumb:null, placeholder:false },
  { type:'pdf',   category:'documents',    label:'Research Reflection',     path:'/Experiences/Research/Research.pdf',            thumb:null, placeholder:false },
  { type:'pdf',   category:'documents',    label:'Leadership Reflection',   path:'/Experiences/Leadership/Leadership2.pdf',       thumb:null, placeholder:false },
  { type:'pdf',   category:'documents',    label:'ISA / ASA Reflection',    path:'/Experiences/Leadership/Leadership.pdf',        thumb:null, placeholder:false },
  { type:'pdf',   category:'documents',    label:'Intercultural Reflection',path:'/Experiences/Intercultural/Intercultural.pdf',  thumb:null, placeholder:false },
  { type:'pdf',   category:'documents',    label:'HONR 475 Synthesis Essay',path:null,    thumb:null,    placeholder:true,  note:'Due at program exit — add when complete' },
  // ── Certificates ──────────────────────────────────────────────────
  { type:'image', category:'certificates', label:'StrengthsFinder Report',  path:finder,  thumb:finder,  placeholder:false },
  { type:'image', category:'certificates', label:'Academic Award',          path:null,    thumb:null,    placeholder:true,  note:'Upload certificates, awards, or recognitions' },
  { type:'image', category:'certificates', label:'Honors Recognition',      path:null,    thumb:null,    placeholder:true,  note:'Honors program completion or achievement certificate' },
  // ── Projects ──────────────────────────────────────────────────────
  { type:'image', category:'projects',     label:'Project Screenshot',      path:null,    thumb:null,    placeholder:true,  note:'Engineering project screenshots or mockups' },
  { type:'video', category:'projects',     label:'Project Demo Video',      path:null,    thumb:null,    placeholder:true,  note:'Demo recording or YouTube embed link' },
  { type:'pdf',   category:'projects',     label:'Technical Report',        path:null,    thumb:null,    placeholder:true,  note:'Research paper, lab report, or capstone document' },
];

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

// ── Placeholder slot ─────────────────────────────────────────────
function PlaceholderSlot({ label, note }) {
  return (
    <div className="hp-placeholder">
      <span className="hp-placeholder__icon">+</span>
      <div style={{ flex: 1 }}>
        <div className="hp-placeholder__label">{label}</div>
        {note && <div className="hp-placeholder__note">{note}</div>}
      </div>
      <span className="hp-placeholder__badge">COMING SOON</span>
    </div>
  );
}

// ── Photo strip ───────────────────────────────────────────────────
function PhotoStrip({ items }) {
  const [lbItems, setLbItems] = useState(null);
  const [lbStart, setLbStart] = useState(0);
  if (!items || items.length === 0) return null;
  const realItems = items.filter(i => !i.placeholder && i.path);
  const open = (item) => {
    if (item.placeholder || !item.path) return;
    setLbItems(realItems);
    setLbStart(Math.max(realItems.indexOf(item), 0));
  };
  return (
    <>
      <div className="photo-strip">
        {items.map((item, i) => (
          <div
            key={i}
            className={`photo-strip__card${item.placeholder ? ' photo-strip__card--placeholder' : ''}`}
            onClick={() => open(item)}
            title={item.placeholder && item.note ? item.note : undefined}
          >
            <div className="photo-strip__thumb">
              {item.path ? (
                <img src={item.thumb || item.path} alt={item.label} className="photo-strip__img"/>
              ) : (
                <div className="photo-strip__blank">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,240,0.1)" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="rgba(240,240,240,0.08)" stroke="none"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                  {item.note && <span className="photo-strip__hint">{item.note}</span>}
                </div>
              )}
              {!item.placeholder && <div className="photo-strip__reveal"><span>VIEW</span></div>}
            </div>
            <div className="photo-strip__footer">
              <span className="photo-strip__label">{item.label}</span>
              {item.placeholder && <span className="photo-strip__add">+ ADD</span>}
            </div>
          </div>
        ))}
      </div>
      {lbItems && (
        <Lightbox items={lbItems} startIndex={lbStart} onClose={() => setLbItems(null)}/>
      )}
    </>
  );
}

// ── Section block ─────────────────────────────────────────────────
function SectionBlock({ label, title, text, photos, children }) {
  return (
    <div className="hp-section">
      {label && <p className="hp-section__label">{label}</p>}
      {title && <h3 className="hp-section__title">{title}</h3>}
      {text  && <p className="hp-section__text">{text}</p>}
      {photos && photos.length > 0 && <PhotoStrip items={photos}/>}
      {children}
    </div>
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
function Scene({ setClicked, setHovered, setGallery }) {
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
      case 'Window_Books_0':  setTargetFocus('books'); break;
      case 'frame_gallery':   setGallery(true); break;
      case 'frame0': if(targetFocus==='frames') { setClicked('frame0'); } else { setTargetFocus('frames'); } break;
      case 'frame1': if(targetFocus==='frames') { setClicked('frame1'); } else { setTargetFocus('frames'); } break;
      case 'frame2': if(targetFocus==='frames') { setClicked('frame2'); } else { setTargetFocus('frames'); } break;
      case 'frame3': if(targetFocus==='frames') { setClicked('frame3'); } else { setTargetFocus('frames'); } break;
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
      <FrameExperiences args={[1,1,1]}       scale={7.1}   name="frame_gallery" position={[0,0,-10.7]} imageUrl={JoelImg} label="Gallery" onHover={setHovered}/>
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
        <li><span className="honors-modal__key">Wall frames</span>Click once to move camera. Click again to open the section detail.</li>
        <li><span className="honors-modal__key">Center portrait</span>Click to open the visual Gallery — all photos, documents, and artifacts in one place.</li>
        <li><span className="honors-modal__key">← Back</span>Returns camera to the origin view.</li>
        <li><span className="honors-modal__key">Gallery / Artifacts</span>Click any card to open fullscreen. Arrow keys to navigate.</li>
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

// ── Honors Program page ───────────────────────────────────────────
function HonorsPage({ handleClick }) {
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">// Honors Program · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← SCENE</button>
      </header>
      <div className="honors-page__content honors-page__content--rich">
        <p className="honors-page__eyebrow">Competency Portfolio</p>
        <h1 className="honors-page__title">HONORS<br/>PROGRAM.</h1>
        <hr className="honors-page__rule"/>
        <p className="honors-page__description">
          The UCA Honors Program challenges students to develop academic excellence, civic
          responsibility, and personal growth. Through core courses, reflective writing,
          and co-curricular engagement, I have worked to deepen my competencies in research,
          leadership, and intercultural awareness.
        </p>

        <SectionBlock
          label="HONR 475 · Capstone Synthesis"
          title="Synthesis Essay"
          text="The HONR 475 capstone asks honors students to synthesize the cumulative knowledge, growth, and experiences gathered throughout the entire honors journey. This essay draws connections across disciplines and reflects on how the honors program has shaped my academic and personal identity."
        >
          <PlaceholderSlot label="HONR 475 Synthesis Essay" note="Artifact pending completion — due at program exit"/>
        </SectionBlock>

        <SectionBlock
          label="HONR 375 · Interdisciplinary Studies"
          title="Why Honors — Junior Reflection"
          text="HONR 375 deepened my interdisciplinary thinking, pushing me to connect engineering principles with fields like ethics, social science, and the humanities. The reflection below documents my growth midway through the honors experience."
          photos={[
            { type:'image', label:'Honors seminar or class photo', path:null, thumb:null, placeholder:true, note:'Upload a photo from an honors class, seminar, or related event' },
          ]}
        >
          <ArtifactGallery items={[ARTIFACTS.honors[1]]}/>
        </SectionBlock>

        <SectionBlock
          label="HONR 201 · First Year Experience"
          title="Why Honors — Initial Essay"
          text="Written during my first year, this essay captures my initial motivations for joining the Honors Program and the goals I set for myself as a new honors student. It serves as a baseline for measuring growth across subsequent years."
          photos={[
            { type:'image', label:'First year / campus arrival photo', path:null, thumb:null, placeholder:true, note:'Upload a photo from your first year on campus or at orientation' },
          ]}
        >
          <ArtifactGallery items={[ARTIFACTS.honors[0]]}/>
        </SectionBlock>
      </div>
    </div>
  );
}

// ── Research & Scholarly Activity page ───────────────────────────
function ResearchPage({ handleClick }) {
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">// Research & Scholarly Activity · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← SCENE</button>
      </header>
      <div className="honors-page__content honors-page__content--rich">
        <p className="honors-page__eyebrow">Competency Area</p>
        <h1 className="honors-page__title">RESEARCH &amp;<br/>SCHOLARLY<br/>ACTIVITY.</h1>
        <hr className="honors-page__rule"/>
        <p className="honors-page__description">
          Research is the cornerstone of intellectual growth. Through scholarly inquiry,
          independent study, and creative projects, I have developed the skills needed
          to ask meaningful questions, gather evidence, and present well-reasoned conclusions.
        </p>

        <SectionBlock
          label="Primary Reflection"
          title="Research Reflection"
          text="This reflection examines my experience with undergraduate research, exploring the methodologies I applied, the challenges I encountered, and the insights I gained. It demonstrates my ability to engage in rigorous scholarly inquiry beyond the classroom."
          photos={[
            { type:'image', label:'Lab or research setting', path:null, thumb:null, placeholder:true, note:'Upload a photo from a lab, research space, or academic environment' },
            { type:'image', label:'Project or experiment photo', path:null, thumb:null, placeholder:true, note:'A photo showing your research process, experiment, or results' },
          ]}
        >
          <ArtifactGallery items={ARTIFACTS.research}/>
        </SectionBlock>

        <SectionBlock
          label="Project Work"
          title="Independent Study / Capstone Project"
          text="Placeholder for a description of an independent study or capstone engineering project, detailing the problem definition, technical approach, and key outcomes achieved."
          photos={[
            { type:'image', label:'Project work in progress', path:null, thumb:null, placeholder:true, note:'Screenshot, prototype photo, or whiteboard work from your project' },
          ]}
        >
          <PlaceholderSlot label="Project Report or Presentation" note="Artifact to be added upon project completion"/>
        </SectionBlock>

        <SectionBlock
          label="Scholarly Contribution"
          title="Publication or Conference Presentation"
          text="Placeholder for any academic publication, conference poster, or presentation that demonstrates active participation in the broader scholarly community."
        >
          <PlaceholderSlot label="Publication or Presentation Artifact" note="To be added upon completion"/>
        </SectionBlock>
      </div>
    </div>
  );
}

// ── Leadership page ───────────────────────────────────────────────
function LeadershipPage({ handleClick }) {
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">// Leadership · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← SCENE</button>
      </header>
      <div className="honors-page__content honors-page__content--rich">
        <p className="honors-page__eyebrow">Competency Area</p>
        <h1 className="honors-page__title">LEADERSHIP.</h1>
        <hr className="honors-page__rule"/>
        <p className="honors-page__description">
          Leadership for me is about service and impact — inspiring those around me,
          fostering collaboration, and working toward meaningful change. Through
          student organizations, academic roles, and community involvement, I have
          actively cultivated the skills that define effective leadership.
        </p>

        <SectionBlock
          label="StrengthsFinder Assessment"
          title="Strength Report"
          text="The CliftonStrengths assessment identified my top strengths, providing a data-driven lens through which I understand how I lead and collaborate most effectively. My top themes inform my approach to team dynamics and personal growth."
          photos={[
            { type:'image', label:'Team activity or group collaboration', path:null, thumb:null, placeholder:true, note:'A photo showing you working with a team or in a collaborative setting' },
          ]}
        >
          <ArtifactGallery items={[ARTIFACTS.leadership[2]]}/>
        </SectionBlock>

        <SectionBlock
          label="Reflection 01 · General Leadership"
          title="Leadership Reflection"
          text="This reflection explores my development as a leader, drawing on specific experiences in student organizations, group projects, and mentorship. I discuss how my leadership style has evolved and what I have learned about motivating and guiding others."
          photos={[
            { type:'image', label:'Leadership role or event photo', path:null, thumb:null, placeholder:true, note:'A photo from a leadership role — presenting, organizing, mentoring, etc.' },
          ]}
        >
          <ArtifactGallery items={[ARTIFACTS.leadership[0]]}/>
        </SectionBlock>

        <SectionBlock
          label="Reflection 02 · Community Engagement"
          title="ISA / ASA Experience"
          text="This artifact documents my involvement with the International Students Association (ISA) and the African Students Association (ASA). Through these roles, I developed cross-cultural leadership skills and deepened my commitment to building inclusive communities."
          photos={[
            { type:'image', label:'ISA event photo', path:null, thumb:null, placeholder:true, note:'Upload a photo from an ISA meeting, event, or activity' },
            { type:'image', label:'ASA community event', path:null, thumb:null, placeholder:true, note:'Upload a photo from an ASA gathering or community event' },
          ]}
        >
          <ArtifactGallery items={[ARTIFACTS.leadership[1]]}/>
        </SectionBlock>

        <SectionBlock
          label="Additional Leadership"
          title="Roles and Initiatives"
          text="Placeholder for additional leadership experiences, club officer roles, volunteer initiatives, or community service projects undertaken during the honors journey."
          photos={[
            { type:'image', label:'Community or volunteer photo', path:null, thumb:null, placeholder:true, note:'A photo from a volunteer activity, club event, or community initiative' },
          ]}
        >
          <PlaceholderSlot label="Additional Leadership Artifact" note="Document a role, initiative, or experience to be added"/>
        </SectionBlock>
      </div>
    </div>
  );
}

// ── Intercultural Engagement page ────────────────────────────────
function InterculturalPage({ handleClick }) {
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">// Intercultural Engagement · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← SCENE</button>
      </header>
      <div className="honors-page__content honors-page__content--rich">
        <p className="honors-page__eyebrow">Competency Area</p>
        <h1 className="honors-page__title">INTERCULTURAL<br/>ENGAGEMENT.</h1>
        <hr className="honors-page__rule"/>
        <p className="honors-page__description">
          Engaging with diverse cultures enriches every dimension of personal and
          professional life. I have actively sought out experiences that challenge
          my worldview, expose me to different perspectives, and build the cross-cultural
          competencies needed to thrive in a global environment.
        </p>

        <SectionBlock
          label="Primary Reflection"
          title="Intercultural Experience Reflection"
          text="This reflection documents a significant intercultural experience and examines how it changed my understanding of cultural difference, privilege, and global citizenship. It explores both the discomfort and the growth that accompany genuine cross-cultural engagement."
          photos={[
            { type:'image', label:'Cultural event or engagement photo', path:null, thumb:null, placeholder:true, note:'A photo from a cultural event, festival, or intercultural exchange' },
            { type:'image', label:'Community gathering or celebration', path:null, thumb:null, placeholder:true, note:'A photo from a diverse community gathering, celebration, or shared experience' },
          ]}
        >
          <ArtifactGallery items={ARTIFACTS.intercultural}/>
        </SectionBlock>

        <SectionBlock
          label="Cultural Immersion"
          title="Study Abroad or International Experience"
          text="Placeholder for a study abroad program, international travel, or immersive cultural exchange that broadened my global perspective and built intercultural communication skills."
          photos={[
            { type:'image', label:'Travel or international experience', path:null, thumb:null, placeholder:true, note:'A photo from international travel, study abroad, or cultural immersion' },
          ]}
        >
          <PlaceholderSlot label="Study Abroad Documentation" note="Artifact pending travel or program completion"/>
        </SectionBlock>

        <SectionBlock
          label="Language and Communication"
          title="Language Learning Journey"
          text="Placeholder for documenting progress in learning an additional language and the cultural insights that accompany that process."
        >
          <PlaceholderSlot label="Language Learning Artifact" note="Certificate, journal entry, or reflection to be added"/>
        </SectionBlock>
      </div>
    </div>
  );
}

// ── About Me page ─────────────────────────────────────────────────
function AboutMePage({ handleClick }) {
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">// About Me · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← SCENE</button>
      </header>
      <div className="honors-page__content honors-page__content--rich">
        <p className="honors-page__eyebrow">Portfolio Introduction</p>
        <h1 className="honors-page__title">ABOUT<br/>ME.</h1>
        <hr className="honors-page__rule"/>

        <div className="hp-about-grid">
          <div className="hp-about-photo">
            <div className="hp-about-photo__placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(240,240,240,0.15)" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <div className="hp-about-photo__label">Professional Photo</div>
          </div>
          <div className="hp-stat-row">
            <div className="hp-stat">
              <span className="hp-stat__key">Name</span>
              <span className="hp-stat__val">Joel Tchouke</span>
            </div>
            <div className="hp-stat">
              <span className="hp-stat__key">Major</span>
              <span className="hp-stat__val">Computer Engineering</span>
            </div>
            <div className="hp-stat">
              <span className="hp-stat__key">Minor / Concentration</span>
              <span className="hp-stat__val hp-stat__val--placeholder">To be determined</span>
            </div>
            <div className="hp-stat">
              <span className="hp-stat__key">University</span>
              <span className="hp-stat__val">University of Central Arkansas</span>
            </div>
            <div className="hp-stat">
              <span className="hp-stat__key">Program</span>
              <span className="hp-stat__val">UCA Honors Program</span>
            </div>
          </div>
        </div>

        <SectionBlock
          label="Future Goals"
          title="Career and Life Vision"
          text="I aim to build a career at the intersection of engineering and innovation — developing systems and products that solve meaningful real-world problems. Long term, I envision founding or leading an initiative that leverages technology for positive social impact, particularly in underserved communities."
        />

        <SectionBlock
          label="Interests and Hobbies"
          title="Beyond the Classroom"
          text="Outside of academics and engineering, I am passionate about music production, fitness, and exploring the ways creative disciplines intersect with technical ones. I enjoy building personal projects, engaging with science and philosophy, and serving my local community through mentorship."
        />

        <SectionBlock
          label="Photo Gallery"
          title="Personal Photos"
          text="A professional headshot and additional personal photos will be added to complete this section of the portfolio."
        >
          <PlaceholderSlot label="Professional Headshot" note="High-resolution photo to be uploaded"/>
          <div style={{ height: 8 }}/>
          <PlaceholderSlot label="Campus or Activity Photos" note="2–3 photos showing campus involvement to be added"/>
        </SectionBlock>
      </div>
    </div>
  );
}

// ── Gallery card ─────────────────────────────────────────────────
function GalleryCard({ item, onOpen }) {
  return (
    <div
      className={`gal-card${item.placeholder ? ' gal-card--placeholder' : ''}`}
      onClick={item.placeholder ? undefined : onOpen}
    >
      <div className="gal-card__thumb">
        {item.type === 'image' && item.thumb ? (
          <img src={item.thumb} alt={item.label}/>
        ) : item.type === 'pdf' && !item.placeholder ? (
          <div className="gal-card__icon-thumb"><PDFIcon/><span className="gal-card__ext">PDF</span></div>
        ) : item.type === 'video' && !item.placeholder ? (
          <div className="gal-card__icon-thumb"><VideoIcon/><span className="gal-card__ext">VIDEO</span></div>
        ) : (
          <div className="gal-card__blank-thumb"><span className="gal-card__blank-icon">+</span></div>
        )}
        {!item.placeholder && <div className="gal-card__reveal"><span>OPEN</span></div>}
      </div>
      <div className="gal-card__footer">
        <span className="gal-card__label">{item.label}</span>
        <span className={`gal-card__cat gal-card__cat--${item.category}`}>{item.category}</span>
      </div>
      {item.placeholder && item.note && (
        <div className="gal-card__note">{item.note}</div>
      )}
    </div>
  );
}

// ── Gallery page ──────────────────────────────────────────────────
const GAL_CATS = ['all', 'photos', 'events', 'documents', 'certificates', 'projects'];

function GalleryPage({ handleClick }) {
  const [activeCat, setActiveCat] = useState('all');
  const [lbItems,   setLbItems]   = useState(null);
  const [lbStart,   setLbStart]   = useState(0);

  const filtered = activeCat === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCat);

  const openItem = (item) => {
    if (item.placeholder) return;
    const realItems = filtered.filter(i => !i.placeholder);
    setLbItems(realItems);
    setLbStart(Math.max(realItems.indexOf(item), 0));
  };

  const realCount    = filtered.filter(i => !i.placeholder).length;
  const pendingCount = filtered.filter(i => i.placeholder).length;

  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">// Gallery · Joel Tchouke</span>
        <button className="honors-page__exit-btn" onClick={handleClick}>← SCENE</button>
      </header>

      <div className="gal-page">
        <div className="gal-header">
          <p className="gal-eyebrow">Visual Archive</p>
          <h1 className="gal-title">GALLERY.</h1>
          <hr className="gal-rule"/>
          <div className="gal-tabs">
            {GAL_CATS.map(cat => (
              <button
                key={cat}
                className={`gal-tab${activeCat === cat ? ' gal-tab--active' : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="gal-count">{realCount} items · {pendingCount} pending</p>
        </div>

        <div className="gal-masonry">
          {filtered.map((item, i) => (
            <GalleryCard key={`${item.category}-${i}`} item={item} onOpen={() => openItem(item)}/>
          ))}
        </div>
      </div>

      {lbItems && (
        <Lightbox items={lbItems} startIndex={lbStart} onClose={() => setLbItems(null)}/>
      )}
    </div>
  );
}

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
  const [aboutMe,setAboutMe]       = useState(false);
  const [gallery,setGallery]       = useState(false);

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
            <button className="scene-nav-btn" onClick={()=>setAboutMe(v=>!v)}>ABOUT ME</button>
            {onNavigate && <button className="scene-nav-btn scene-nav-btn--back" onClick={()=>onNavigate('main')}>← MAIN</button>}
            <span className="scene-topbar__bracket">]</span>
          </nav>
        </header>

        {targetFocus!=='origin' && <button className="scene-exit-btn" onClick={()=>setTargetFocus('origin')}>← BACK</button>}

        {helpClick            && <HelpView         handleClick={()=>setHelpClick(v=>!v)}/>}
        {clicked==='frame0'   && <HonorsPage       handleClick={close}/>}
        {clicked==='frame1'   && <ResearchPage     handleClick={close}/>}
        {clicked==='frame2'   && <LeadershipPage   handleClick={close}/>}
        {clicked==='frame3'   && <InterculturalPage handleClick={close}/>}
        {aboutMe              && <AboutMePage      handleClick={()=>setAboutMe(false)}/>}
        {gallery              && <GalleryPage      handleClick={()=>setGallery(false)}/>}

        {intro   && <GeneralPopUP header="Introduction"     description="Welcome to my honors portfolio. My name is Joel Tchouke, and I am passionate about growing as a leader and using my skills to make a meaningful impact in the world. Through my journey as an honors student, I have worked to combine my knowledge of engineering with a strong desire to serve others and solve real-world problems." click={()=>setIntro(v=>!v)}/>}
        {welcome && <GeneralPopUP header="Welcome"          description="Hello and welcome. I'm Joel Tchouke, and this portfolio is a reflection of my journey, growth, and accomplishments. Here you'll find projects, experiences, and insights that showcase my passion for engineering, leadership, and making a positive impact." click={()=>setWelcome(v=>!v)}/>}
        {mission && <GeneralPopUP header="Mission Statement" description="My mission is to use my skills in engineering and leadership to make a strong, positive impact in the environment around me. I am dedicated to solving real-world problems and creating solutions that not only advance technology but also improve the lives of those I work with." click={()=>setMission(v=>!v)}/>}

        <Canvas dpr={[1,1.5]} performance={{min:0.5}} gl={{antialias:true,powerPreference:'high-performance'}}>
          <Suspense fallback={null}>
            <Scene setClicked={setClicked} setHovered={setHovered} setGallery={setGallery}/>
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