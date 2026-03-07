import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";
import "./../css/main.css";

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

    vec2 p = -1.0 + 2.0 * uv;
    p -= trailGrad * 0.75;

    vec3 color = 0.05 - vec3(pattern(p));
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

function Main({ onNavigate }) {
  const navRef  = useRef();

  useEffect(() => {
    // ── GSAP section scroll ───────────────────────────────────────────────────
    const sections = [
      document.querySelector('.mainPageDiv'),
      document.getElementById('about'),
    ];
    let current = 0;
    let scrolling = false;

    const onWheel = (e) => {
      e.preventDefault();
      if (scrolling) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(sections.length - 1, current + dir));
      if (next === current) return;
      scrolling = true;
      current = next;
      const target = sections[next].offsetTop;
      const proxy = { y: window.scrollY };
      gsap.to(proxy, {
        y: target,
        duration: 1.0,
        ease: 'power3.inOut',
        onUpdate: () => window.scrollTo(0, proxy.y),
        onComplete: () => { scrolling = false; },
      });
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
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
        <Canvas dpr={[1, 2]} gl={{ antialias: true }} camera={{ position: [0, 0, 1] }}>
          <LiquidPlane />
        </Canvas>
      </div>

      <header className="topBar">
        <span className="topBar__item">TCHOUKEJOEL@GMAIL.COM</span>
        <span className="topBar__item">MANKATO, MN</span>
        <div className="topBar__logo">TJ</div>
        <span className="topBar__item">AVAILABLE FOR WORK</span>
        <a href="#contact" className="topBar__item topBar__contact">CONTACT ↗</a>
      </header>

      <div className="heroBody">
        <p>
            Curious about how things work — and how they could work better.<br />
            I build <strong>systems, software, and ideas</strong><br />
            that move from concept to reality.
        </p>
        <a href="#works" className="ctaBtn">VIEW WORK →</a>
      </div>

      <nav className="centerNav" ref={navRef}>
        <span className="navBracket navBracket--left">[</span>
        <a href="#works">WORKS</a>
        <a href="#about">ABOUT</a>
        <a href="#projects">PROJECTS</a>
        <a href="#honors" onClick={(e) => { e.preventDefault(); onNavigate('honors'); }}>HONORS</a>
        <a href="#contact">CONTACT</a>
        <span className="navBracket navBracket--right">]</span>
      </nav>

      <h1 className="heroName">JOEL TCHOUKE</h1>
    </main>

    <section id="about" style={{
      minHeight: '100vh',
      background: '#050505',
      position: 'relative',
    }} />

    </>
  );
}

export default Main;