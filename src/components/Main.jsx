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

  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
  }

  float blob(vec2 p, vec2 c, float r) {
    return length(p - c) - r;
  }

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

  float fbm6(vec2 p) {
    float f = 0.0;
    f += 0.250000 * (0.5 + 0.5 * noise(p)); p = m * p * 2.03;
    f += 0.125000 * (0.5 + 0.5 * noise(p)); p = m * p * 2.01;
    f += 0.062500 * (0.5 + 0.5 * noise(p)); p = m * p * 2.04;
    f += 0.031250 * (0.5 + 0.5 * noise(p)); p = m * p * 2.01;
    f += 0.500000 * (0.5 + 0.5 * noise(p)); p = m * p * 2.02;
    f += 0.015625 * (0.5 + 0.5 * noise(p));
    return f / 0.96875;
  }

  float pattern(in vec2 p, float t) {
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0)),
      fbm(p + vec2(5.2, 1.3) * (t + 100.0) * 0.01)
    );

    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(1.7, 9.2)),
      fbm(p + 4.0 * q + vec2(8.3, 2.8))
    );

    return fbm(p + 4.0 * r);
  }

  float liquidField(vec2 p, float t) {
    vec2 pp = p;

    // Large-scale only. No visible grain.
    vec2 warpA = vec2(
      pattern(pp * 0.55 + vec2(t * 0.035, -t * 0.020), t),
      pattern(pp * 0.55 + vec2(2.7 - t * 0.025, 1.4 + t * 0.030), t)
    );

    vec2 warpB = vec2(
      fbm(pp * 0.85 + vec2(-t * 0.040, t * 0.030)),
      fbm(pp * 0.85 + vec2(3.1 + t * 0.025, -2.0 - t * 0.020))
    );

    warpA = (warpA - 0.25) * 0.18;
    warpB = (warpB - 0.10) * 0.10;

    pp += warpA + warpB;

    // Broad directional shear for cinematic flow
    pp.x += 0.10 * sin(pp.y * 1.35 + t * 0.32);
    pp.y += 0.05 * sin(pp.x * 1.10 - t * 0.24);

    // Big off-frame masses instead of many little blobs
    vec2 c1 = vec2(-1.10 + sin(t * 0.20) * 0.10,  0.42 + cos(t * 0.16) * 0.10);
    vec2 c2 = vec2( 1.06 + cos(t * 0.18) * 0.10,  0.26 + sin(t * 0.14) * 0.08);
    vec2 c3 = vec2(-0.18 + sin(t * 0.13) * 0.08, -0.98 + cos(t * 0.11) * 0.08);
    vec2 c4 = vec2( 0.22 + cos(t * 0.12) * 0.06,  1.02 + sin(t * 0.10) * 0.06);

    float d1 = blob(pp * vec2(1.00, 0.90), c1, 0.96);
    float d2 = blob(pp * vec2(0.96, 1.04), c2, 0.92);
    float d3 = blob(pp * vec2(1.10, 0.78), c3, 0.98);
    float d4 = blob(pp * vec2(1.06, 0.82), c4, 0.88);

    float field = smin(d1, d2, 0.62);
    field = smin(field, d3, 0.66);
    field = smin(field, d4, 0.60);

    // Tiny contour softness only. No visible sparkle texture.
    float contour = pattern(pp * 0.9, t);
    field += (contour - 0.20) * 0.035;

    return field;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);

    vec2 p = uv - 0.5;
    p.x *= aspect.x;

    float t = uTime * 0.11;

    float trail = texture2D(uTrailTexture, uv).r;

    float px = 1.0 / uResolution.x;
    float py = 1.0 / uResolution.y;

    float trailL = texture2D(uTrailTexture, uv - vec2(px * 18.0, 0.0)).r;
    float trailR = texture2D(uTrailTexture, uv + vec2(px * 18.0, 0.0)).r;
    float trailB = texture2D(uTrailTexture, uv - vec2(0.0, py * 18.0)).r;
    float trailT = texture2D(uTrailTexture, uv + vec2(0.0, py * 18.0)).r;

    vec2 trailGrad = vec2(trailR - trailL, trailT - trailB);

    // softer, less twitchy trail deformation
    vec2 q = p;
    q -= trailGrad * 1.15;
    q += trailGrad.yx * vec2(-0.04, 0.04);

    float f = liquidField(q, t);

    float eps = 0.014;
    float fx = liquidField(q + vec2(eps, 0.0), t) - liquidField(q - vec2(eps, 0.0), t);
    float fy = liquidField(q + vec2(0.0, eps), t) - liquidField(q - vec2(0.0, eps), t);

    // Softer normals to avoid sparkle
    vec3 normal = normalize(vec3(-fx * 10.0, -fy * 10.0, 1.0));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);

    // Wide lighting, not pin-point highlights
    vec3 light1 = normalize(vec3(-0.80,  0.35, 0.58));
    vec3 light2 = normalize(vec3( 0.78, -0.22, 0.52));

    float spec1 = pow(max(dot(reflect(-light1, normal), viewDir), 0.0), 22.0);
    float spec2 = pow(max(dot(reflect(-light2, normal), viewDir), 0.0), 18.0);

    float diffuse = max(dot(normal, light1), 0.0);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.8);

    float body  = 1.0 - smoothstep(0.00, 0.22, f);
    float inner = 1.0 - smoothstep(-0.14, 0.03, f);
    float edge  = 1.0 - smoothstep(0.0, 0.04, abs(f));

    float groove = smoothstep(0.03, 0.58, trail);
    float rim    = smoothstep(0.06, 0.22, trail) - smoothstep(0.30, 0.78, trail);

    vec3 bg        = vec3(0.0,   0.0,   0.0);
    vec3 darkMetal = vec3(0.010, 0.010, 0.012);
    vec3 midMetal  = vec3(0.060, 0.060, 0.070);
    vec3 silver    = vec3(0.82,  0.82,  0.86);
    vec3 hotWhite  = vec3(0.98,  0.98,  1.00);

    vec3 color = bg;

    color = mix(color, darkMetal, body);
    color = mix(color, midMetal, diffuse * inner * 0.18);

    color += silver   * spec1 * inner * 0.90;
    color += hotWhite * spec2 * inner * 0.55;

    color += silver * fresnel * edge * 0.30;

    // keep trail response
    color -= groove * 0.11 * body;
    color += rim * 0.035 * edge;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

function LiquidPlane() {
  const materialRef = useRef();
  const { size } = useThree();

  const trailCanvasRef = useRef(document.createElement("canvas"));
  const trailCtxRef = useRef(null);
  const trailTextureRef = useRef(null);

  const pointerRef = useRef({
    x: 0.5,
    y: 0.5,
    lastX: 0.5,
    lastY: 0.5,
    initialized: false,
  });

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

    // slower relaxation
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

      // around 3x bigger than before
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

function Main() {
  const dotRef  = useRef();
  const ringRef = useRef();
  const navRef  = useRef();

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    const moveX = gsap.quickTo(dot,  'x', { duration: 0.08, ease: 'power3' });
    const moveY = gsap.quickTo(dot,  'y', { duration: 0.08, ease: 'power3' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.28, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.28, ease: 'power3' });
    const onMove = (e) => {
      moveX(e.clientX); moveY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    };
    window.addEventListener('mousemove', onMove);

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
      gsap.to(bL, { x: lr.left  - nr.left - bL.offsetWidth - 0.2, duration: dur, ease: 'power3.out' });
      gsap.to(bR, { x: lr.right - nr.left + 0.2,                  duration: dur, ease: 'power3.out' });
      links.forEach(l =>
        gsap.to(l, { color: l === link ? 'rgba(240,240,240,1)' : 'rgba(240,240,240,0.55)', duration: 0.2 })
      );
    };

    // Initialise on first link after layout is painted
    requestAnimationFrame(() => snap(links[0], true));

    links.forEach(link => link.addEventListener('mouseenter', () => snap(link)));
    navEl.addEventListener('mouseleave', () => snap(links[0]));

    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <main className="mainPageDiv">
      <div className="cursor"     ref={dotRef}  />
      <div className="cursorRing" ref={ringRef} />
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
        <a href="#contact">CONTACT</a>
        <span className="navBracket navBracket--right">]</span>
      </nav>

      <h1 className="heroName">JOEL TCHOUKE</h1>
    </main>
  );
}

export default Main;