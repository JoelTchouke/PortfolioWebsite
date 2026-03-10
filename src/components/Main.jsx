import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from 'react-router-dom';
import gsap from "gsap";
import * as THREE from "three";
import "./../css/main.css";
import Jarvis from "./Jarvis";
import Projects from "./Projects";
import Contact from "./Contact";
import Resume from "./Resume";
import Footer from "./Footer";

class CanvasErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {}
  render() { return this.state.failed ? null : this.props.children; }
}

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform sampler2D uTrailTexture;

  const mat2 m = mat2(0.8, 0.6, -0.6, 0.8);

  float noise(in vec2 p) {
    return sin(p.x) * sin(p.y);
  }

  float fbm(vec2 p) {
    float f = 0.5000 * noise(p); p *= 2.02;
    f += 0.2500 * noise(p); p *= 2.03;
    f += 0.1250 * noise(p); p *= 2.01;
    f += 0.0625 * noise(p); p *= 2.04;
    return f / 0.9375;
  }

  float pattern(in vec2 p) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0)),
      fbm(p + vec2(5.2, 1.3) * (uTime + 100.0) * 0.004)
    );
    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(1.7, 9.2)),
      fbm(p + 4.0 * q + vec2(8.3, 2.8))
    );
    return fbm(p + 4.0 * r);
  }

  void main() {
    vec2 uv = vUv;
    float px = 1.0 / uResolution.x;
    float py = 1.0 / uResolution.y;

    float trailL = texture2D(uTrailTexture, uv - vec2(px * 22.0, 0.0)).r * 0.6 +
                   texture2D(uTrailTexture, uv - vec2(px * 12.0, 0.0)).r * 0.4;
    float trailR = texture2D(uTrailTexture, uv + vec2(px * 22.0, 0.0)).r * 0.6 +
                   texture2D(uTrailTexture, uv + vec2(px * 12.0, 0.0)).r * 0.4;
    float trailB = texture2D(uTrailTexture, uv - vec2(0.0, py * 22.0)).r * 0.6 +
                   texture2D(uTrailTexture, uv - vec2(0.0, py * 12.0)).r * 0.4;
    float trailT = texture2D(uTrailTexture, uv + vec2(0.0, py * 22.0)).r * 0.6 +
                   texture2D(uTrailTexture, uv + vec2(0.0, py * 12.0)).r * 0.4;

    vec2 trailGrad = vec2(trailR - trailL, trailT - trailB);
    trailGrad = sign(trailGrad) * pow(abs(trailGrad), vec2(1.35));

    float aspect = uResolution.x / uResolution.y;
    vec2 p = -1.0 + 2.0 * uv;
    p.x *= aspect;
    p -= trailGrad * 0.75;

    vec3 color = 0.02 - vec3(pattern(p));

    // Microscopic inclined grid — ~5 px cells, 13° tilt
    float ca = 0.97437;
    float sa = 0.22495;
    vec2 gUv = vec2(ca * uv.x - sa * uv.y,
                    sa * uv.x + ca * uv.y) * uResolution / 5.0;
    vec2 gf  = fract(gUv);
    float lw = 0.08;
    float gx = smoothstep(0.0, lw, gf.x) * (1.0 - smoothstep(1.0 - lw, 1.0, gf.x));
    float gy = smoothstep(0.0, lw, gf.y) * (1.0 - smoothstep(1.0 - lw, 1.0, gf.y));
    color += (1.0 - gx * gy) * 0.028;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

function LiquidPlane() {
  const materialRef = useRef();
  const { size } = useThree();

  const trailCanvasRef = useRef(document.createElement("canvas"));
  const trailCtxRef = useRef(null);
  const trailTextureRef = useRef(null);

  const pointerRef = useRef({ x: 0.5, y: 0.5, lastX: 0.5, lastY: 0.5, initialized: false });

  useEffect(() => {
    const canvas = trailCanvasRef.current;
    canvas.width = 1536;
    canvas.height = 1536;
    const ctx = canvas.getContext("2d");
    trailCtxRef.current = ctx;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    trailTextureRef.current = texture;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      if (!pointerRef.current.initialized) {
        pointerRef.current.lastX = x;
        pointerRef.current.lastY = y;
        pointerRef.current.initialized = true;
      }
      pointerRef.current.x = x;
      pointerRef.current.y = y;
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uTrailTexture: { value: null },
    }),
    [size.width, size.height]
  );

  useFrame((state) => {
    if (!materialRef.current || !trailCtxRef.current || !trailTextureRef.current) return;

    const ctx = trailCtxRef.current;
    const canvas = trailCanvasRef.current;
    const pointer = pointerRef.current;

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0, 0, 0, 0.025)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const x = pointer.x * canvas.width;
    const y = pointer.y * canvas.height;
    const lx = pointer.lastX * canvas.width;
    const ly = pointer.lastY * canvas.height;
    const dx = x - lx;
    const dy = y - ly;
    const speed = Math.sqrt(dx * dx + dy * dy);

    if (speed > 0.05) {
      ctx.globalCompositeOperation = "lighter";
      const lineWidth = Math.min(140, 42 + speed * 0.65);
      ctx.strokeStyle = "rgba(255,255,255,0.13)";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(x, y);
      ctx.stroke();
      const grad = ctx.createRadialGradient(x, y, 0, x, y, lineWidth * 2.2);
      grad.addColorStop(0, "rgba(255,255,255,0.13)");
      grad.addColorStop(0.32, "rgba(255,255,255,0.08)");
      grad.addColorStop(0.68, "rgba(255,255,255,0.03)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, lineWidth * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    pointer.lastX = THREE.MathUtils.lerp(pointer.lastX, pointer.x, 0.22);
    pointer.lastY = THREE.MathUtils.lerp(pointer.lastY, pointer.y, 0.22);

    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "blur(10px)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";

    trailTextureRef.current.needsUpdate = true;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    materialRef.current.uniforms.uTrailTexture.value = trailTextureRef.current;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

const WORDS = ['Engineer.', 'Builder.', 'Thinker.'];

function TypeWriter() {
  const [displayed, setDisplayed] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[wordIndex];
    let timeout;

    if (!deleting && displayed === word) {
      timeout = setTimeout(() => setDeleting(true), 1600);
    } else if (deleting && displayed === '') {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % WORDS.length);
    } else {
      const speed = deleting ? 80 : 160;
      timeout = setTimeout(() => {
        setDisplayed(deleting ? word.slice(0, displayed.length - 1) : word.slice(0, displayed.length + 1));
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex]);

  return (
    <h2 className="aboutDisplay">
      {displayed}<span className="aboutDisplay__cursor" />
    </h2>
  );
}

const SLIDE_COUNT = 4;
const SLIDE_COLORS = ['#050505', '#030511', '#07030b', '#090404'];

function FloatingOrb() {
  const meshRef = useRef();
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.18;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.32;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
  });
  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.32, 160, 12]} />
      <meshBasicMaterial color="#b41c10" wireframe opacity={0.45} transparent />
    </mesh>
  );
}

const SECTION_PATHS = ['/', '/about', '/resume', '/projects', '/contact'];

function Main({ onNavigate, initialSection = 0 }) {
  const location = useLocation();

  // debug – show search params/state
  console.log('Main render', { pathname: location.pathname, search: location.search, state: location.state });

  // derive flag from query parameter or state
  const searchParams = new URLSearchParams(location.search);
  const initialFromHonors = searchParams.get('from') === 'honors' || !!location.state?.fromHonors;
  const [comingFromHonors, setLocalComing] = useState(initialFromHonors);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const flag = params.get('from') === 'honors' || !!location.state?.fromHonors;
    setLocalComing(flag);
  }, [location]);

  const navRef        = useRef();
  const sliderRef     = useRef();
  const underlineRef  = useRef();
  const scrollToRef   = useRef(null);          // exposes scrollToSection outside effect
  const jumpToRef     = useRef(null);          // exposes jumpToSection for instant jumps
  const currentRef      = useRef(initialSection);
  const currentSlideRef = useRef(0);
  const scrollingRef    = useRef(false);
  const [slideIndex,      setSlideIndex]      = useState(0);
  const [directNav,       setDirectNav]       = useState(initialSection > 0);
  const [currentSection,  setCurrentSection]  = useState(initialSection);

  // animation configuration – tweak these to make scrolling/transition faster
  const SECTION_SCROLL_DURATION = 0.8;    // was 1.0
  const SLIDE_TRANSITION_DURATION = 1.0;  // was 1.5
  const SLIDE_BG_DURATION = 1.0;          // background color change

  // Deploy underline lines outward from center sphere
  const deployUnderline = (delay = 0) => {
    const el = underlineRef.current;
    if (!el) return;
    const [left, , right] = el.children;
    gsap.fromTo([left, right], { scaleX: 0 }, { scaleX: 1, duration: 1.1, delay, ease: 'power3.out' });
  };

  // Retract underline lines back to center sphere
  const retractUnderline = () => {
    const el = underlineRef.current;
    if (!el) return;
    const [left, , right] = el.children;
    gsap.to([left, right], { scaleX: 0, duration: 0.7, ease: 'power3.in' });
  };

  useEffect(() => {
    // ── GSAP section scroll + horizontal slides ───────────────────────────────
    window.history.scrollRestoration = 'manual';
    if (initialSection === 0) {
      window.scrollTo(0, 0);
      deployUnderline(0.6);
    }

    const sections = [
      document.querySelector('.mainPageDiv'),
      document.getElementById('about'),
      document.getElementById('resume'),
      document.getElementById('projects'),
      document.getElementById('contact'),
      document.getElementById('footer'),
    ];

    const scrollToSection = (idx) => {
      scrollingRef.current = true;
      currentRef.current   = idx;
      setCurrentSection(idx);
      if (idx === 0) setDirectNav(false);
      const target = sections[idx].offsetTop;
      const proxy  = { y: window.scrollY };
      gsap.to(proxy, {
        y: target, duration: SECTION_SCROLL_DURATION, ease: 'power3.inOut',
        onUpdate:  () => window.scrollTo(0, proxy.y),
        onComplete: () => {
          scrollingRef.current = false;
          // ← Update URL when scroll lands
          window.history.replaceState({}, '', SECTION_PATHS[idx] ?? '/');
        },
      });
    };

    const jumpToSection = (idx) => {
      scrollingRef.current = false;
      currentRef.current   = idx;
      setCurrentSection(idx);
      if (idx === 0) setDirectNav(false);
      window.scrollTo(0, sections[idx].offsetTop);
      // ← Update URL immediately on jump
      window.history.replaceState({}, '', SECTION_PATHS[idx] ?? '/');
    };

    // expose helpers separately: one for gradual scroll, one for instant jump
    scrollToRef.current = scrollToSection;
    jumpToRef.current   = jumpToSection;

    const handleDir = (dir) => {
      if (scrollingRef.current) return;
      const current      = currentRef.current;
      const currentSlide = currentSlideRef.current;

      if (current === 1) {
        const nextSlide = currentSlide + dir;
        if (nextSlide >= 0 && nextSlide < SLIDE_COUNT) {
          scrollingRef.current     = true;
          currentSlideRef.current  = nextSlide;
          setSlideIndex(nextSlide);

          const slider     = sliderRef.current;
          const leftPanel  = slider.parentElement;
          const slideWidth = leftPanel.offsetWidth;
          const incoming   = slider.children[nextSlide];

          gsap.to(slider, {
            x: -nextSlide * slideWidth,
            duration: SLIDE_TRANSITION_DURATION, ease: 'power2.inOut',
            onComplete: () => { scrollingRef.current = false; },
          });
          gsap.to(leftPanel, {
            backgroundColor: SLIDE_COLORS[nextSlide],
            duration: SLIDE_BG_DURATION, ease: 'power2.inOut',
          });
          gsap.fromTo(
            [...incoming.children],
            { opacity: 0, x: dir * 24 },
            { opacity: 1, x: 0, duration: 0.7, stagger: 0.09, delay: 0.55, ease: 'power2.out' }
          );
          return;
        }
        if (nextSlide < 0) {
          currentSlideRef.current = 0;
          setSlideIndex(0);
          gsap.set(sliderRef.current, { x: 0 });
          gsap.to(sliderRef.current.parentElement, {
            backgroundColor: SLIDE_COLORS[0], duration: SLIDE_BG_DURATION, ease: 'power2.inOut',
          });
          deployUnderline(0.3);
          scrollToSection(0);
        } else {
          scrollToSection(2);
        }
        return;
      }

      const next = Math.max(0, Math.min(sections.length - 1, current + dir));
      if (next === current) return;
      if (next === 1) { currentSlideRef.current = 0; setSlideIndex(0); if (sliderRef.current) gsap.set(sliderRef.current, { x: 0 }); retractUnderline(); }
      if (next === 0) { deployUnderline(0.3); }
      scrollToSection(next);
    };

    const onWheel = (e) => {
      e.preventDefault();
      handleDir(e.deltaY > 0 ? 1 : -1);
    };

    const onKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' ||
          e.key === ' ' || e.key === 'Enter') {
        // Don't hijack keys when user is typing in an input/textarea
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        if (e.key === 'ArrowDown' || e.key === ' ') handleDir(1);
        if (e.key === 'ArrowUp')                    handleDir(-1);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // ── Handle curtain-jump navigation from nav menu ─────────────
  useEffect(() => {
  const handler = (e) => {
    const dest = e.detail;
    const idx = dest === 'about' ? 1 : dest === 'resume' ? 2 : dest === 'projects' ? 3 : dest === 'contact' ? 4 : 0;
    currentRef.current      = idx;
    currentSlideRef.current = 0;
    setSlideIndex(0);
    setCurrentSection(idx);
    setDirectNav(idx > 0);
    if (sliderRef.current) gsap.set(sliderRef.current, { x: 0 });
    if (idx === 0) deployUnderline(0.4);

    // use jumpToRef for instant navigation when curtain covers page
    if (jumpToRef.current) jumpToRef.current(idx);
  };
  window.addEventListener('sectionJump', handler);
  return () => window.removeEventListener('sectionJump', handler);
}, []);

  // ── Scroll to initial section on direct URL load ──────────────
  useEffect(() => {
    if (initialSection > 0) {
      const el = initialSection === 1
        ? document.getElementById('about')
        : initialSection === 2
        ? document.getElementById('resume')
        : initialSection === 3
        ? document.getElementById('projects')
        : initialSection === 4
        ? document.getElementById('contact')
        : document.querySelector('.mainPageDiv');
      if (el) window.scrollTo(0, el.offsetTop);
    }
  }, []);

  useEffect(() => {
    // ── Moving bracket nav indicator ─────────────────────────────────────────
    const navEl = navRef.current;
    const bL    = navEl.querySelector('.navBracket--left');
    const bR    = navEl.querySelector('.navBracket--right');
    const links = [...navEl.querySelectorAll('a')];

    // Let GSAP own all transforms so it can freely animate x + yPercent together
    gsap.set([bL, bR], { yPercent: -50 });

    const snap = (link, instant = false) => {
      const nr  = navEl.getBoundingClientRect();
      const lr  = link.getBoundingClientRect();
      const dur = instant ? 0 : 0.32;
      const pad = parseFloat(getComputedStyle(link).paddingLeft);
      gsap.to(bL, { x: lr.left  - nr.left - bL.offsetWidth + pad * 0.5, duration: dur, ease: 'power3.out' });
      gsap.to(bR, { x: lr.right - nr.left - pad * 0.5,                  duration: dur, ease: 'power3.out' });
      links.forEach(l =>
        gsap.to(l, { color: l === link ? 'rgba(240,240,240,1)' : 'rgba(240,240,240,0.55)', duration: 0.2 })
      );
    };

    // Initialise on first link after layout is painted
    requestAnimationFrame(() => snap(links[0], true));

    links.forEach(link => link.addEventListener('mouseenter', () => snap(link)));
    navEl.addEventListener('mouseleave', () => snap(links[0]));
  }, []);

  return (
    <>
    <main className="mainPageDiv">
      <div className="shaderBg">
        {window.__webglSupported && (
          <CanvasErrorBoundary>
            <Canvas dpr={[1, 2]} gl={{ antialias: true, failIfMajorPerformanceCaveat: false }} camera={{ position: [0, 0, 1] }}>
              <LiquidPlane />
            </Canvas>
          </CanvasErrorBoundary>
        )}
      </div>

      <header className="topBar">
        <span className="topBar__item">TCHOUKEJOEL@GMAIL.COM</span>
        <span className="topBar__item">MANKATO, MN</span>
        <div className="topBar__logo">TJ</div>
        <span className="topBar__item">AVAILABLE FOR WORK</span>
       {/* <a href="#resume" className="topBar__item topBar__contact"
        onClick={(e) => { e.preventDefault(); onNavigate('resume'); }}>
        RÉSUMÉ ↗
        </a>*/}
        <a href="#contact" className="topBar__item topBar__contact"
        onClick={(e) => { e.preventDefault(); onNavigate('contact'); }}>
        CONTACT ↗
        </a>      
        </header>

      <div className="heroBody">
        <p>
            Curious about how things work — and how they could work better.<br />
            I build <strong>systems, software, and ideas</strong><br />
            that move from concept to reality.
        </p>
        <a href="#works" className="ctaBtn" onClick={(e) => { e.preventDefault(); onNavigate('projects'); }}>VIEW WORK →</a>
      </div>

      <nav className="centerNav" ref={navRef}>
        <span className="navBracket navBracket--left">[</span>
        <a href="#home"    onClick={(e) => { e.preventDefault(); onNavigate('main'); }}>HOME</a>
        <a href="#about"    onClick={(e) => { e.preventDefault(); onNavigate('about');    }}>ABOUT</a>
        <a href="#resume" onClick={(e) => { e.preventDefault(); onNavigate('resume'); }}>RÉSUMÉ</a>
        <a href="#projects" onClick={(e) => { e.preventDefault(); onNavigate('projects'); }}>PROJECTS</a>
        <a href="#honors" onClick={(e) => { e.preventDefault(); onNavigate('honors'); }}>HONORS</a>
        <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }}>CONTACT</a>
        <span className="navBracket navBracket--right">]</span>
      </nav>

      <div className="heroNameBlock">
        <div className="heroNameRow">
          {/* Left blade: curved base at right, tapers to point at left */}
          <svg className="heroNameLine" viewBox="0 0 300 4" preserveAspectRatio="none">
            <path d="M298,0.3 A3,1.7 0 0 1 298,3.7 L0,2Z" fill="rgba(240,240,240,0.32)"/>
          </svg>
          <h1 className="heroName">JOEL TCHOUKE</h1>
          {/* Right blade: curved base at left, tapers to point at right */}
          <svg className="heroNameLine" viewBox="0 0 300 4" preserveAspectRatio="none">
            <path d="M2,0.3 A3,1.7 0 0 0 2,3.7 L300,2Z" fill="rgba(240,240,240,0.32)"/>
          </svg>
        </div>
        <div className="heroUnderline" ref={underlineRef}>
          <span className="heroUnderline__line" />
          <span className="heroUnderline__sphere" />
          <span className="heroUnderline__line" />
        </div>
      </div>
    </main>

    <section id="about" className="aboutSection">
      {/* back button when coming from honors */}
      {comingFromHonors && (
        <button className="aboutBack" onClick={() => onNavigate('honors')} style={{position:'absolute', zIndex: 100}}>
          ← BACK TO HONORS
        </button>
      )}
      <div className="aboutLeft">

        {/* ── Slider ── */}
        <div className="aboutSlider" ref={sliderRef}>

          {/* Slide 1 — Introduction */}
          <div className="aboutSlide aboutSlide--intro">
            <p className="aboutEyebrow">About</p>
            <TypeWriter />
            <hr className="aboutRule" />
            <p className="aboutBio">
              I'm Joel Tchouke, a software engineer and systems builder based in Mankato, MN.
              I'm drawn to the intersection of deep technical craft and meaningful product design —
              building things that don't just work, but feel inevitable.
            </p>
            <p className="aboutBio">Currently available for full-time roles and select freelance projects.</p>
            <div className="aboutSkills">
              <span>React</span><span>Node.js</span><span>Three.js</span>
              <span>Python</span><span>Systems Design</span>
            </div>
            <p className="slideHint">SCROLL TO EXPLORE →</p>
          </div>

          {/* Slide 2 — Craft */}
          <div className="aboutSlide aboutSlide--craft">
            <div className="craftDecor" />
            <p className="aboutEyebrow">Craft</p>
            <h2 className="aboutDisplay">Embedded<br />in everything.</h2>
            <hr className="aboutRule" />
            <div className="craftGrid">
              <div className="craftItem">
                <span className="craftNum">01</span>
                <span className="craftName">Embedded Systems</span>
                <p className="craftDesc">ARM microcontrollers, STM32, ATtiny — firmware at the metal level.</p>
              </div>
              <div className="craftItem">
                <span className="craftNum">02</span>
                <span className="craftName">Cybersecurity</span>
                <p className="craftDesc">SIEM analysis, incident triage, network telemetry investigation.</p>
              </div>
              <div className="craftItem">
                <span className="craftNum">03</span>
                <span className="craftName">Hardware Design</span>
                <p className="craftDesc">PCB layout with KiCad, power management, sensor integration.</p>
              </div>
              <div className="craftItem">
                <span className="craftNum">04</span>
                <span className="craftName">Web Engineering</span>
                <p className="craftDesc">React, Three.js, WebGL — interfaces at the edge of hardware.</p>
              </div>
            </div>
          </div>

          {/* Slide 3 — Life */}
          <div className="aboutSlide aboutSlide--life">
            <div className="lifeCanvas3D">
              {window.__webglSupported && (
                <CanvasErrorBoundary>
                  <Canvas camera={{ position: [0, 0, 4] }} gl={{ antialias: true, failIfMajorPerformanceCaveat: false }}>
                    <FloatingOrb />
                  </Canvas>
                </CanvasErrorBoundary>
              )}
            </div>
            <p className="aboutEyebrow">Life</p>
            <h2 className="aboutDisplay">Beyond the<br />machine.</h2>
            <hr className="aboutRule" />
            <div className="hobbiesRow">
              <div className="hobbyCard">
                <div className="hobbyImg">
                  <img src="/images/hobby-music.jpg" alt="Music" />
                  <span className="hobbyImg__tag">Music</span>
                </div>
                <p className="hobbyText">Joel is a musician — creative expression through sound and rhythm.</p>
              </div>
              <div className="hobbyCard">
                <div className="hobbyImg">
                  <img src="/images/hobby-chess.jpg" alt="Chess" />
                  <span className="hobbyImg__tag">Chess</span>
                </div>
                <p className="hobbyText">Strategy and patience — the infinite game of calculated thinking.</p>
              </div>
            </div>
            <div className="lifeBgWords" aria-hidden="true">
              <span>MUSIC</span><span>CHESS</span>
            </div>
          </div>

          {/* Slide 4 — Experience */}
          <div className="aboutSlide aboutSlide--xp">
            <p className="aboutEyebrow">Experience</p>
            <h2 className="aboutDisplay">Where I've<br />been.</h2>
            <hr className="aboutRule" />
            <div className="timeline">
              <div className="tlItem">
                <span className="tlYear">2024</span>
                <div className="tlBody">
                  <span className="tlRole">Embedded Software Intern</span>
                  <span className="tlOrg">AGCO</span>
                  <p className="tlDesc">Embedded C/C++, ARM microcontrollers, sensor integration on production agricultural systems.</p>
                </div>
              </div>
              <div className="tlItem">
                <span className="tlYear">2023</span>
                <div className="tlBody">
                  <span className="tlRole">SOC Analyst</span>
                  <span className="tlOrg">MSU IT Solutions</span>
                  <p className="tlDesc">Splunk SIEM, Microsoft Defender, network telemetry — campus infrastructure security.</p>
                </div>
              </div>
              <div className="tlItem">
                <span className="tlYear">2022</span>
                <div className="tlBody">
                  <span className="tlRole">Research Assistant</span>
                  <span className="tlOrg">MSU — Embedded Systems Lab</span>
                  <p className="tlDesc">ATtiny85 power management system, KiCad PCB design, robotics power optimization.</p>
                </div>
              </div>
            </div>
          </div>

        </div>{/* end .aboutSlider */}

        {/* Slide progress dots */}
        <div className="slideDots">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <div key={i} className={`slideDot${slideIndex === i ? ' slideDot--active' : ''}`} />
          ))}
        </div>

        {/* Progress bar */}
        <div className="slideProgressBar">
          <div className="slideProgressFill" style={{ width: `${(slideIndex / (SLIDE_COUNT - 1)) * 100}%` }} />
        </div>

      </div>

      <div className="aboutDivider" />
      <div className="aboutRight"><Jarvis /></div>
    </section>
    <Resume embedded onNavigate={onNavigate} />
    <Projects embedded onNavigate={onNavigate} />
    <Contact embedded onNavigate={onNavigate}/>
    <Footer embedded onNavigate={onNavigate} />

    {/* floating navigation suppressed if we landed here from honors */}
    {directNav && !comingFromHonors && !comingFromHonors && (
      <nav className="floatingNav">
        <span className="navBracket navBracket--left">[</span>
        <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('main'); }}>HOME</a>
        {currentSection !== 1 && (
          <a href="/about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }}>ABOUT</a>
        )}
        {currentSection !== 2 && (
          <a href="/resume" onClick={(e) => { e.preventDefault(); onNavigate('resume'); }}>RÉSUMÉ</a>
        )}
        {currentSection !== 3 && (
          <a href="/projects" onClick={(e) => { e.preventDefault(); onNavigate('projects'); }}>PROJECTS</a>
        )}
        {currentSection !== 4 && (
          <a href="/contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }}>CONTACT</a>
        )}
        <a href="/honors" onClick={(e) => { e.preventDefault(); onNavigate('honors'); }}>HONORS</a>
        <span className="navBracket navBracket--right">]</span>
      </nav>
    )}

    </>
  );
}

export default Main;