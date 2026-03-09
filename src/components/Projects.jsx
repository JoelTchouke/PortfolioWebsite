import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
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
    id: 1, title: 'Autonomous Navigation System', category: 'Embedded/Firmware', year: '2024',
    desc: 'Developed embedded control systems for autonomous agricultural vehicles at AGCO Corporation. Implemented real-time sensor fusion on ARM Cortex-M with sub-10ms latency.',
    tags: ['C/C++', 'RTOS', 'CAN Bus', 'ARM Cortex-M'],
    images: [
      'https://picsum.photos/seed/nav1/400/260',
      'https://picsum.photos/seed/nav2/400/260',
      'https://picsum.photos/seed/nav3/400/260',
    ],
  },
  {
    id: 2, title: 'Threat Intelligence Dashboard', category: 'Cybersecurity', year: '2023',
    desc: 'Real-time threat monitoring platform for SOC operations. Integrated SIEM data sources and automated incident response workflows using the MITRE ATT&CK framework.',
    tags: ['Python', 'SIEM', 'MITRE ATT&CK', 'ELK Stack'],
    images: [
      'https://picsum.photos/seed/soc1/400/260',
      'https://picsum.photos/seed/soc2/400/260',
      'https://picsum.photos/seed/soc3/400/260',
    ],
  },
  {
    id: 3, title: 'Computer Vision Pipeline', category: 'Software', year: '2023',
    desc: 'Scalable ML pipeline for agricultural image analysis. 94% accuracy in crop disease detection using CNNs trained on 50k+ labeled images.',
    tags: ['Python', 'PyTorch', 'OpenCV', 'Docker'],
    images: [
      'https://picsum.photos/seed/cv1/400/260',
      'https://picsum.photos/seed/cv2/400/260',
      'https://picsum.photos/seed/cv3/400/260',
    ],
  },
  {
    id: 4, title: 'Firmware Vulnerability Scanner', category: 'Cybersecurity', year: '2024',
    desc: 'Automated binary analysis tool for identifying security vulnerabilities in embedded firmware. Combines static and dynamic analysis techniques.',
    tags: ['Ghidra', 'Python', 'Binary Analysis', 'IoT'],
    images: [
      'https://picsum.photos/seed/fw1/400/260',
      'https://picsum.photos/seed/fw2/400/260',
      'https://picsum.photos/seed/fw3/400/260',
    ],
  },
  {
    id: 5, title: 'High-Speed DAQ System', category: 'Embedded/Firmware', year: '2022',
    desc: 'High-speed data acquisition for agricultural sensor arrays. Sub-millisecond latency across CAN and Ethernet with FPGA-accelerated signal processing.',
    tags: ['C', 'FPGA', 'Ethernet', 'DSP'],
    images: [
      'https://picsum.photos/seed/daq1/400/260',
      'https://picsum.photos/seed/daq2/400/260',
      'https://picsum.photos/seed/daq3/400/260',
    ],
  },
  {
    id: 6, title: 'IoT Intrusion Detection', category: 'Cybersecurity', year: '2022',
    desc: 'ML-based IDS for IoT networks. Research on anomaly detection in resource-constrained environments, achieving 97% detection rate.',
    tags: ['Python', 'ML', 'IoT', 'Networking'],
    images: [
      'https://picsum.photos/seed/ids1/400/260',
      'https://picsum.photos/seed/ids2/400/260',
      'https://picsum.photos/seed/ids3/400/260',
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

  // Load cover image; fall back gracefully if missing
  const texture = useTexture(project.images[0]);
  texture.colorSpace = THREE.SRGBColorSpace;

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
      <mesh onClick={() => onSelect(isSelected ? null : project.id)}>
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
  const detailRef = useRef();

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
    <div className="projPage" id={embedded ? 'projects' : undefined}>
      {window.__webglSupported && (
        <CanvasErrorBoundary>
          <Canvas className="projCanvas" camera={{ position: [0, 2.2, 7.5], fov: 58 }} gl={{ failIfMajorPerformanceCaveat: false }}>
            <Scene projects={filtered} selected={selected} onSelect={setSelected} />
          </Canvas>
        </CanvasErrorBoundary>
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
          <span className="projHint">CLICK A CARD TO EXPLORE</span>
        </div>
      </div>
    </div>
  );
}

export default Projects;
