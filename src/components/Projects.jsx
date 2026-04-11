import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Html } from "@react-three/drei";
import { Component, useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";
import "../css/projects.css";

class CanvasErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {}
  render() { return this.state.failed ? null : this.props.children; }
}

const PROJECTS = [
  {
    id: 1,
    title: 'Advanced Smart Glasses System',
    category: 'Embedded / AI',
    year: '2024',
    desc: 'Developed an advanced smart glasses platform focused on accessibility. Integrated text-to-speech, object recognition, and wireless communication modules to assist users by interpreting and describing their environment in real time.',
    tags: ['Python', 'Computer Vision', 'Embedded Systems', 'TTS'],
    images: [
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    ],
  },

  {
    id: 2,
    title: 'LEGO Robotics Power Management PCB',
    category: 'Embedded / Hardware',
    year: '2024',
    desc: 'Designed a power management system for a robotics LEGO brick using an ATtiny85 microcontroller. Implemented rechargeable battery integration, battery level monitoring, and sleep-mode energy optimization using a custom KiCad PCB.',
    tags: ['ATtiny85', 'KiCad', 'PCB Design', 'Power Systems'],
    images: [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
    ],
  },

  {
    id: 3,
    title: 'SOC Security Investigation Workflows',
    category: 'Cybersecurity',
    year: '2024',
    desc: 'Conducted security investigations within a Security Operations Center environment using Splunk and network telemetry. Built structured workflows for DHCP attribution, endpoint investigation, and incident validation across campus infrastructure.',
    tags: ['Splunk', 'Network Analysis', 'SOC', 'Incident Response'],
    images: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548092372-0d1bd40894a3?auto=format&fit=crop&w=800&q=80',
    ],
  },

  {
    id: 4,
    title: 'STM32 PWM Audio Generation',
    category: 'Embedded / Firmware',
    year: '2024',
    desc: 'Programmed an STM32L475 microcontroller to generate audio signals using timer-based PWM output. Implemented hardware timer configuration and GPIO control to drive a speaker and reproduce musical tones in real time.',
    tags: ['STM32', 'C', 'Timers', 'PWM'],
    images: [
      'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=800&q=80',
    ],
  },

  {
    id: 5,
    title: 'Full-Stack Application Development',
    category: 'Software Engineering',
    year: '2023',
    desc: 'Built multiple full-stack applications including an e-commerce website, a banking transaction management system, and a mobile delivery application. Focused on UI design, backend logic, and scalable application architecture.',
    tags: ['React', 'Web Apps', 'Node.js', 'APIs'],
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    ],
  },

  {
    id: 6,
    title: 'Interactive Terminal Portfolio Environment',
    category: 'Systems / DevOps',
    year: '2025',
    desc: 'Built a containerized Linux investigation environment embedded directly inside a portfolio website. Each user session launches an isolated Docker container with controlled resources and a hidden engineering puzzle.',
    tags: ['Docker', 'Node.js', 'Linux', 'WebSockets'],
    images: [
      'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

const CAT_ACCENT = {
  'Embedded/Firmware': '#e03000',
  'Cybersecurity':     '#cc0000',
  'Software':          '#990000',
};

// ── 3D: single star layer (truly distant — never near camera) ─
function StarLayer({ count, color, size, rotSpeed, opacity, phaseOffset = 0 }) {
  const ref = useRef();
  const matRef = useRef();

  // Stars distributed on a large sphere shell so none are ever close
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Uniform random point on sphere surface, then push to large radius
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 55 + Math.random() * 30; // 55–85 units away
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y = t * rotSpeed;
      ref.current.rotation.x = t * rotSpeed * 0.38;
    }
    if (matRef.current) {
      matRef.current.opacity = opacity * (0.78 + 0.22 * Math.sin(t * 0.9 + phaseOffset));
    }
  });

  return (
    <points ref={ref} renderOrder={-10}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation={false}   /* fixed pixel size — no size change with distance */
        depthWrite={false}
        depthTest={false}         /* always behind everything */
      />
    </points>
  );
}

// ── 3D: full star field ───────────────────────────────────────
function StarField() {
  return (
    <>
      <StarLayer count={700} color="#ffffff" size={0.8}  rotSpeed={0.0018} opacity={0.45} phaseOffset={0.0} />
      <StarLayer count={300} color="#ffffff" size={1.3}  rotSpeed={0.0025} opacity={0.65} phaseOffset={1.2} />
      <StarLayer count={150} color="#ffffff" size={1.8}  rotSpeed={0.0020} opacity={0.80} phaseOffset={2.4} />
      <StarLayer count={60}  color="#ffffff" size={2.4}  rotSpeed={0.0015} opacity={0.95} phaseOffset={4.1} />
    </>
  );
}

// ── 3D: background slow rings ─────────────────────────────────
function BackgroundRings() {
  const r1 = useRef();
  const r2 = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (r1.current) { r1.current.rotation.x = t * 0.07; r1.current.rotation.z = t * 0.04; }
    if (r2.current) { r2.current.rotation.y = t * 0.05; r2.current.rotation.x = t * 0.03; }
  });
  return (
    <>
      <mesh ref={r1}>
        <torusGeometry args={[6.5, 0.012, 4, 120]} />
        <meshBasicMaterial color="#1a0000" transparent opacity={0.5} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[8.5, 0.008, 4, 150]} />
        <meshBasicMaterial color="#110000" transparent opacity={0.35} />
      </mesh>
    </>
  );
}

// ── Orb ───────────────────────────────────────────────────────
function ArtisticOrb() {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.12;
      meshRef.current.rotation.x = t * 0.08;
      meshRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.0, 1]} />
      <meshBasicMaterial color="#cc1100" wireframe />
    </mesh>
  );
}

// ── 3D: individual orbiting card ──────────────────────────────
function ProjectCard({ index, total, isSelected, onSelect, project }) {
  const groupRef    = useRef();
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));
  const orbitPos    = useRef(new THREE.Vector3());
  const featPos     = useRef(new THREE.Vector3());
  const scratchDir  = useRef(new THREE.Vector3());
  const scratchObj  = useRef(new THREE.Object3D());

  const baseAngle = (index / total) * Math.PI * 2;
  const RADIUS    = 3.2;

  const edgesGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.05, 1.55, 0.05)),
    []
  );

  const [hovered, setHovered] = useState(false);

  // Load cover image; fall back gracefully if missing
  const texture = useTexture(project.images[0]);
  texture.colorSpace = THREE.SRGBColorSpace;

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.center.set(0.5, 0.5);

  const tileAspect = 1.05 / 1.55;

  if (texture.image) {
    const imageAspect = texture.image.width / texture.image.height;

    if (imageAspect > tileAspect) {
      // image is wider
      texture.repeat.set(tileAspect / imageAspect, 1);
    } else {
      // image is taller
      texture.repeat.set(1, imageAspect / tileAspect);
    }
  }

  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return;

    if (isSelected) {
      camera.getWorldDirection(scratchDir.current);
      featPos.current.copy(camera.position).addScaledVector(scratchDir.current, 3.8);
      groupRef.current.position.lerp(featPos.current, 0.07);

      scratchObj.current.position.copy(groupRef.current.position);
      scratchObj.current.lookAt(camera.position);
      groupRef.current.quaternion.slerp(scratchObj.current.quaternion, 0.07);
    } else {
      const a = baseAngle + clock.elapsedTime * 0.1;
      orbitPos.current.set(
        Math.cos(a) * RADIUS,
        Math.sin(clock.elapsedTime * 0.45 + index) * 0.09,
        Math.sin(a) * RADIUS
      );
      groupRef.current.position.lerp(orbitPos.current, 0.08);
      groupRef.current.rotation.y = -a + Math.PI / 2;
    }

    targetScale.current.setScalar(isSelected ? 1.7 : 1);
    groupRef.current.scale.lerp(targetScale.current, 0.06);
  });

  // BoxGeometry face order: +x, -x, +y, -y, front(+z), back(-z)
  const edgeMat = { color: '#0a0a0a', metalness: 0.92, roughness: 0.22 };

  return (
    <group ref={groupRef}>
      <mesh
        onClick={() => onSelect(isSelected ? null : project.id)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.05, 1.55, 0.05]} />
        {/* side edges — dark metal */}
        <meshStandardMaterial attach="material-0" {...edgeMat} />
        <meshStandardMaterial attach="material-1" {...edgeMat} />
        <meshStandardMaterial attach="material-2" {...edgeMat} />
        <meshStandardMaterial attach="material-3" {...edgeMat} />
        {/* front (+z) — project image */}
        <meshStandardMaterial
          attach="material-4"
          map={texture}
          metalness={0.0}
          roughness={0.80}
          emissive="#110000"
          emissiveIntensity={isSelected ? 0.18 : 0.0}
        />
        {/* back (-z) — same image */}
        <meshStandardMaterial
          attach="material-5"
          map={texture}
          metalness={0.0}
          roughness={0.80}
          emissive="#110000"
          emissiveIntensity={isSelected ? 0.18 : 0.0}
        />
      </mesh>
      <lineSegments>
        <primitive object={edgesGeo} attach="geometry" />
        <lineBasicMaterial
          color={isSelected ? '#cc0000' : '#2a2a2a'}
          transparent
          opacity={isSelected ? 0.9 : 0.5}
        />
      </lineSegments>
      {hovered && !isSelected && (
        <Html
          position={[0, 1.0, 0]}
          center
          distanceFactor={8}
          style={{
            pointerEvents: "none",
            transition: "opacity 0.2s ease",
          }}
        >
          <div className="projectHoverLabel">
            {project.title}
          </div>
        </Html>
      )}
    </group>
  );
}

// ── 3D: full scene ────────────────────────────────────────────
function Scene({ projects, selected, onSelect }) {
  return (
    <>
      <ambientLight intensity={0.75} />
      {/* Powerful front fill — camera-aligned, can't miss card faces */}
      <pointLight position={[0,  2,  9]} intensity={9.0} color="#ffffff" distance={22} decay={1.2} />
      <pointLight position={[-5, 2,  8]} intensity={4.5} color="#eef4ff" distance={18} decay={1.4} />
      <pointLight position={[ 5, 2,  8]} intensity={4.5} color="#eef4ff" distance={18} decay={1.4} />
      <pointLight position={[0, -3,  8]} intensity={3.0} color="#ffffff" distance={16} decay={1.5} />
      {/* Red light hitting the orb */}
      <pointLight position={[2, 2, 3]}   intensity={6.0} color="#ff2200" distance={8}  decay={2} />
      <pointLight position={[-2, -1, 2]} intensity={3.0} color="#ff4400" distance={6}  decay={2} />
      <BackgroundRings />
      <StarField />
      <ArtisticOrb />
      {projects.map((proj, i) => (
        <ProjectCard
          key={proj.id}
          project={proj}
          index={i}
          total={projects.length}
          isSelected={selected === proj.id}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

// ── Main component ────────────────────────────────────────────
function Projects({ onNavigate, embedded = false, showBack = false }) {
  const [selected,  setSelected]  = useState(null);
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('All');
  const [isMobile,  setIsMobile]  = useState(() => window.innerWidth <= 768);
  const detailRef = useRef();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const selectedProject = PROJECTS.find(p => p.id === selected);

  const filtered = PROJECTS.filter(p => {
    const matchCat    = category === 'All' || p.category === category;
    const q           = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  useEffect(() => {
    if (!detailRef.current || !selected) return;
    gsap.fromTo(detailRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
    );
  }, [selected]);

  return (
    <div className={`projPage${isMobile ? ' projPage--mobile' : ''}`} id={embedded ? 'projects' : undefined}>

      {/* 3D canvas — desktop only */}
      {!isMobile && window.__webglSupported && (
        <CanvasErrorBoundary>
          <Canvas className="projCanvas" camera={{ position: [0, 2.2, 7.5], fov: 58 }} gl={{ failIfMajorPerformanceCaveat: false }}>
            <Scene projects={filtered} selected={selected} onSelect={setSelected} />
          </Canvas>
        </CanvasErrorBoundary>
      )}

      {/* Mobile card list */}
      {isMobile && (
        <div className="projMobileList">
          {filtered.map(proj => (
            <div
              key={proj.id}
              className={`projMobileCard${selected === proj.id ? ' projMobileCard--active' : ''}`}
              onClick={() => setSelected(selected === proj.id ? null : proj.id)}
            >
              <img src={proj.images[0]} alt={proj.title} className="projMobileCard__img" />
              <div className="projMobileCard__body">
                <span className="projMobileCard__cat">{proj.category}</span>
                <h3 className="projMobileCard__title">{proj.title}</h3>
                <span className="projMobileCard__year">{proj.year}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="projUI">
        {/* ── Top bar ── */}
        <div className="projTopBar">
          {(showBack || !embedded) && onNavigate && (
            <button className="projBack" onClick={() => onNavigate('main')}>← MAIN</button>
          )}
          <h1 className="projHeading">PROJECTS</h1>
          <div className="projSearch">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Embedded/Firmware">Embedded / Firmware</option>
              <option value="Software">Software</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
          </div>
        </div>

        {/* ── Detail panel ── */}
        {selected && selectedProject && (
          <div className="projDetail" ref={detailRef}>
            <button className="projDetailClose" onClick={() => setSelected(null)}>✕</button>
            <span className="projDetailCat" style={{ color: CAT_ACCENT[selectedProject.category] }}>
              {selectedProject.category}
            </span>
            <h2 className="projDetailTitle">{selectedProject.title}</h2>

            {/* Image gallery */}
            <div className="projDetailImages">
              {selectedProject.images.map((src, i) => (
                <img key={i} src={src} alt="" className="projDetailImg" />
              ))}
            </div>

            <p className="projDetailDesc">{selectedProject.desc}</p>
            <div className="projDetailTags">
              {selectedProject.tags.map(t => (
                <span key={t} className="projDetailTag">{t}</span>
              ))}
            </div>
            <span className="projDetailYear">{selectedProject.year}</span>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="projFooter">
          <span>{filtered.length} / {PROJECTS.length} PROJECTS</span>
          <span className="projHint">{isMobile ? 'TAP A CARD TO EXPLORE' : 'CLICK A CARD TO EXPLORE'}</span>
        </div>
      </div>
    </div>
  );
}

export default Projects;
