import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
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

  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
  }

  float blob(vec2 p, vec2 c, float r) {
    return length(p - c) - r;
  }

  float liquidField(vec2 p, float t) {
    // Each blob sits near an edge of the visible area and drifts with large
    // amplitude so it visibly enters, merges with neighbours, and retreats —
    // two incommensurate frequencies per axis keep the path non-repeating.
    vec2 c1 = vec2(-0.55 + sin(t * 0.37) * 0.38 + cos(t * 0.19) * 0.13,
                    0.18 + cos(t * 0.28) * 0.32 + sin(t * 0.15) * 0.10);
    vec2 c2 = vec2( 0.52 + cos(t * 0.31) * 0.36 + sin(t * 0.22) * 0.11,
                   -0.12 + sin(t * 0.24) * 0.30 + cos(t * 0.13) * 0.09);
    vec2 c3 = vec2(-0.08 + sin(t * 0.21) * 0.40 + cos(t * 0.35) * 0.10,
                   -0.28 + cos(t * 0.18) * 0.34 + sin(t * 0.27) * 0.08);
    vec2 c4 = vec2( 0.68 + cos(t * 0.17) * 0.34 + sin(t * 0.26) * 0.10,
                    0.32 + sin(t * 0.14) * 0.28 + cos(t * 0.33) * 0.08);
    vec2 c5 = vec2(-0.75 + sin(t * 0.13) * 0.32 + cos(t * 0.21) * 0.09,
                   -0.35 + cos(t * 0.16) * 0.26 + sin(t * 0.30) * 0.07);

    float r1 = 0.56 + sin(t * 0.19) * 0.05;
    float r2 = 0.62 + cos(t * 0.13) * 0.06;
    float r3 = 0.52 + sin(t * 0.17) * 0.05;
    float r4 = 0.46 + cos(t * 0.11) * 0.04;
    float r5 = 0.50 + sin(t * 0.15) * 0.04;

    float d1 = blob(p, c1, r1);
    float d2 = blob(p, c2, r2);
    float d3 = blob(p, c3, r3);
    float d4 = blob(p, c4, r4);
    float d5 = blob(p, c5, r5);

    // Large k values → very smooth, organic merging as blobs approach
    float m = smin(d1, d2, 0.55);
    m = smin(m, d3, 0.50);
    m = smin(m, d4, 0.44);
    m = smin(m, d5, 0.40);

    return m;
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

    float trailL = texture2D(uTrailTexture, uv - vec2(px * 12.0, 0.0)).r;
    float trailR = texture2D(uTrailTexture, uv + vec2(px * 12.0, 0.0)).r;
    float trailB = texture2D(uTrailTexture, uv - vec2(0.0, py * 12.0)).r;
    float trailT = texture2D(uTrailTexture, uv + vec2(0.0, py * 12.0)).r;

    vec2 trailGrad = vec2(trailR - trailL, trailT - trailB);

    vec2 q = p;
    q -= trailGrad * 1.8;
    q += trailGrad.yx * vec2(-0.10, 0.10);

    float f = liquidField(q, t);

    float eps = 0.010;
    float fx = liquidField(q + vec2(eps, 0.0), t) - liquidField(q - vec2(eps, 0.0), t);
    float fy = liquidField(q + vec2(0.0, eps), t) - liquidField(q - vec2(0.0, eps), t);

    vec3 normal = normalize(vec3(-fx * 24.0, -fy * 24.0, 1.0));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);

    // Two lights — each produces a curved band following the blob surface
    // Keep both well to the side so they never point at the viewer and create a cone
    vec3 light1 = normalize(vec3(-0.70,  0.75, 0.65));
    vec3 light2 = normalize(vec3( 0.65, -0.55, 0.58));

    // Moderate specular power → wide organic bands, not a pin-point spotlight
    float specPow = 72.0;
    float spec1 = pow(max(dot(reflect(-light1, normal), viewDir), 0.0), specPow);
    float spec2 = pow(max(dot(reflect(-light2, normal), viewDir), 0.0), specPow * 1.15);

    // Soft diffuse — gives subtle body shading so blob reads as 3-D volume
    float diffuse = max(dot(normal, light1), 0.0);

    // Fresnel: brightens the silhouette edge of each blob
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.5);

    float body  = 1.0 - smoothstep(0.00, 0.18, f);
    float inner = 1.0 - smoothstep(-0.10, 0.02, f);
    float edge  = 1.0 - smoothstep(0.0, 0.03, abs(f));

    float groove = smoothstep(0.03, 0.58, trail);
    float rim    = smoothstep(0.06, 0.22, trail) - smoothstep(0.30, 0.78, trail);

    vec3 bg        = vec3(0.0,   0.0,   0.0);
    vec3 darkMetal = vec3(0.008, 0.008, 0.010);
    vec3 midMetal  = vec3(0.048, 0.048, 0.058);
    vec3 silver    = vec3(0.78,  0.78,  0.82);
    vec3 hotWhite  = vec3(0.95,  0.96,  1.00);

    vec3 color = bg;

    // Near-black base with just enough diffuse for volume
    color = mix(color, darkMetal, body);
    color = mix(color, midMetal, diffuse * inner * 0.22);

    // Two wide curved highlight bands — these are the organic surface texture
    color += silver   * spec1 * inner * 0.88;
    color += hotWhite * spec2 * inner * 0.60;

    // Silhouette glow
    color += silver * fresnel * edge * 0.35;

    // Mouse interaction
    color -= groove * 0.18 * body;
    color += rim * 0.07 * edge;

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
  return (
    <div className="mainPageDiv">
      <div className="shaderBg">
        <Canvas dpr={[1, 2]} gl={{ antialias: true }} camera={{ position: [0, 0, 1] }}>
          <LiquidPlane />
        </Canvas>
      </div>

      <h1>Joel Tchouke</h1>
    </div>
  );
}

export default Main;