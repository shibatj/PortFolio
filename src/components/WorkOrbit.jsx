import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../data.js";
import { useLang } from "../i18n.js";

/*
  วงแหวนผลงาน 3 มิติ (three.js + shader ที่เขียนเอง)

  โครงสร้างฉาก
  - ราวโครเมียม 2 วง (บน/ล่าง) ใช้ MeshPhysicalMaterial + สะท้อน RoomEnvironment
    และแทรก shader เพิ่มแสงวิ่งตามราว (onBeforeCompile)
  - แผ่นผลงาน N แผ่นโค้งตามทรงกระบอก (ดัดใน vertex shader) มีตัวหนีบโลหะยึดกับราว
  - แกนกลางเป็นทรงกลมบิดด้วย noise + fresnel และวงอนุภาคฝุ่นรอบนอก

  การเลื่อน (ScrollTrigger pin + scrub) → progress p ∈ [0,1]
    [0, INTRO]          วงแหวนเข้าฉาก
    [INTRO, OUTRO]      แผ่นที่ i ค่อย ๆ ปรากฏ (dissolve) แล้ววงหมุนพาแผ่นนั้นมาด้านหน้า
    [OUTRO, 1]          กล้องถอยขึ้นด้านบน เห็นผลงานทั้งหมดรอบวง
*/

const N = projects.length;
const R = 3.35;            // รัศมีที่แผ่นผลงานวางอยู่
const PANEL_W = 2.4;
const PANEL_H = 1.5;
const INTRO = 0.07;
const OUTRO = 0.82;
const STEP = (Math.PI * 2) / N;

const ACCENT = { dark: "#7cf5c8", light: "#0a8a65" };

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- shaders ----------
const NOISE = /* glsl */ `
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}`;

const PANEL_VERT = /* glsl */ `
uniform float uTime, uVel, uReveal, uR;
varying vec2 vUv; varying vec3 vN; varying vec3 vWorld;
void main(){
  vUv = uv;
  vec3 p = position;
  // คลื่นตามความเร็วการเลื่อน
  p.y += sin(p.x * 2.2 + uTime * 3.0) * uVel * 0.09;
  // ดัดแผ่นเรียบให้โค้งตามทรงกระบอกรัศมี uR (จุดกึ่งกลางอยู่ที่ z = 0)
  float a = p.x / uR;
  vec3 bent = vec3(uR * sin(a), p.y, uR * cos(a) - uR);
  // ระหว่างปรากฏ แผ่นค่อย ๆ เลื่อนออกมาจากวง
  bent.z -= (1.0 - uReveal) * 0.5;
  vec4 wp = modelMatrix * vec4(bent, 1.0);
  vWorld = wp.xyz;
  vN = normalize(mat3(modelMatrix) * vec3(sin(a), 0.0, cos(a)));
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const PANEL_FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform float uTime, uReveal, uActive, uVel;
uniform vec3 uAccent;
varying vec2 vUv; varying vec3 vN; varying vec3 vWorld;
${NOISE}
float rbox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main(){
  vec2 uv = vUv;
  // มุมโค้งมน (SDF ของสี่เหลี่ยมมุมมน)
  float d = rbox((uv - 0.5) * vec2(1.6, 1.0), vec2(0.8, 0.5), 0.045);
  if (d > 0.0) discard;

  // dissolve: noise สองชั้น เทียบกับ threshold ที่โตตาม uReveal
  float n = noise(uv * vec2(9.0, 5.6)) * 0.7 + noise(uv * vec2(27.0, 17.0)) * 0.3;
  float th = uReveal * 1.12 - 0.06;
  if (n > th) discard;
  float burn = smoothstep(th - 0.07, th, n) * step(uReveal, 0.999);

  vec3 c;
  // ด้านหลังแผ่นก็แสดงภาพ (กลับแกน x ไม่ให้เป็นภาพกระจก) เพื่อให้ตอนมองทั้งวงเห็นงานฝั่งไกลด้วย
  if (!gl_FrontFacing) uv.x = 1.0 - uv.x;
  {
    // RGB split ตามความเร็วการเลื่อน
    float s = uVel * 0.014;
    c.r = texture2D(uTex, uv + vec2(s, 0.0)).r;
    c.g = texture2D(uTex, uv).g;
    c.b = texture2D(uTex, uv - vec2(s, 0.0)).b;
    // แผ่นที่ไม่ได้อยู่ด้านหน้า: ลดสีและความสว่าง
    float g = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(g) * 0.45, c, 0.25 + 0.75 * uActive);
    c *= 0.965 + 0.035 * sin(uv.y * 420.0 + uTime * 4.0);
    // fresnel ขอบเรืองแสง
    vec3 V = normalize(cameraPosition - vWorld);
    float fr = pow(1.0 - abs(dot(normalize(vN), V)), 2.5);
    c += uAccent * fr * 0.25;
  }
  if (!gl_FrontFacing) c *= 0.72;
  // กรอบเรืองแสงตามขอบ SDF
  float rim = smoothstep(-0.014, 0.0, d);
  c = mix(c, uAccent, rim * (0.25 + 0.75 * uActive));
  c += uAccent * burn * 2.0;

  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

const CORE_VERT = /* glsl */ `
uniform float uTime;
varying vec3 vN; varying vec3 vWorld; varying float vDisp;
${NOISE}
void main(){
  vec3 p = position;
  float d = noise(p.xy * 1.6 + uTime * 0.25) * 0.5 + noise(p.yz * 2.3 - uTime * 0.2) * 0.5;
  vDisp = d;
  p += normal * (d - 0.5) * 0.28;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vWorld = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const CORE_FRAG = /* glsl */ `
uniform vec3 uAccent; uniform float uTime;
varying vec3 vN; varying vec3 vWorld; varying float vDisp;
void main(){
  vec3 V = normalize(cameraPosition - vWorld);
  float fr = pow(1.0 - abs(dot(normalize(vN), V)), 2.2);
  float bands = 0.5 + 0.5 * sin(vDisp * 40.0 - uTime * 1.5);
  vec3 c = uAccent * (fr * 1.2 + bands * 0.12);
  gl_FragColor = vec4(c, clamp(fr * 0.95 + bands * 0.08, 0.0, 1.0));
  #include <colorspace_fragment>
}`;

const DUST_VERT = /* glsl */ `
uniform float uTime, uSize;
attribute float aSeed;
varying float vA;
void main(){
  vec3 p = position;
  float a = uTime * (0.03 + aSeed * 0.05);
  p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
  p.y += sin(uTime * 0.6 + aSeed * 30.0) * 0.08;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vA = 0.35 + 0.65 * fract(aSeed * 17.0);
  gl_PointSize = uSize * (0.6 + aSeed) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const DUST_FRAG = /* glsl */ `
uniform vec3 uAccent;
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(uAccent, (1.0 - d * 2.0) * vA * 0.8);
  #include <colorspace_fragment>
}`;

// แทรกแสงวิ่งตามราวโครเมียมเข้าไปใน MeshPhysicalMaterial
function chromeWithStreak(uniforms) {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xd8dde6, metalness: 1, roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.2,
  });
  m.defines = { USE_UV: "" };
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uAccent = uniforms.uAccent;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;\nuniform vec3 uAccent;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float streak = pow(fract(vUv.x * 3.0 - uTime * 0.12), 28.0);
        float groove = smoothstep(0.92, 1.0, abs(sin(vUv.y * 6.2831)));
        totalEmissiveRadiance += uAccent * (streak * 2.2 + groove * 0.05);`
      );
  };
  return m;
}

export default function WorkOrbit({ theme = "dark" }) {
  const { t, ui } = useLang();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const progress = useRef(0);
  const velocity = useRef(0);
  const accentRef = useRef(new THREE.Color(ACCENT[theme]));
  const [active, setActive] = useState(0);
  const [overview, setOverview] = useState(false);

  useEffect(() => { accentRef.current.set(ACCENT[theme]); }, [theme]);

  // pin + scrub (useLayoutEffect ของลูกทำงานก่อนของ App จึงคำนวณ pin spacing ก่อน trigger อื่น)
  useLayoutEffect(() => {
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: () => `+=${window.innerHeight * (N * 0.9 + 1.2)}`,
      pin: true,
      scrub: true,
      refreshPriority: 1,
      onUpdate: (self) => {
        progress.current = self.progress;
        velocity.current = self.getVelocity();
      },
    });
    // โหลดแบบ lazy จึงถูกสร้างหลัง trigger อื่น → คำนวณตำแหน่งทั้งหมดใหม่ (pin มี refreshPriority สูงกว่า)
    ScrollTrigger.refresh();
    return () => st.kill();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const uniforms = { uTime: { value: 0 }, uAccent: { value: accentRef.current } };

    const rig = new THREE.Group();     // เอียงทั้งชุด
    const spin = new THREE.Group();    // หมุนรอบแกน Y ตามการเลื่อน
    rig.add(spin);
    scene.add(rig);

    // ราวโครเมียมบน/ล่าง
    const chrome = chromeWithStreak(uniforms);
    const railGeo = new THREE.TorusGeometry(R, 0.055, 24, 320);
    for (const y of [PANEL_H / 2 + 0.11, -PANEL_H / 2 - 0.11]) {
      const rail = new THREE.Mesh(railGeo, chrome);
      rail.rotation.x = Math.PI / 2;
      rail.position.y = y;
      spin.add(rail);
    }
    // วงแหวนตกแต่งด้านใน (หนากว่า หมุนสวนทาง)
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(R * 0.62, 0.11, 32, 256), chrome);
    innerRing.rotation.x = Math.PI / 2;
    scene.add(innerRing);

    // ตัวหนีบ
    const clampGeo = new THREE.BoxGeometry(0.22, 0.2, 0.12);
    const clampMat = new THREE.MeshPhysicalMaterial({ color: 0x9aa3b5, metalness: 1, roughness: 0.35 });

    // แผ่นผลงาน
    const loader = new THREE.TextureLoader();
    const panelGeo = new THREE.PlaneGeometry(PANEL_W, PANEL_H, 48, 6);
    const panels = projects.map((p, i) => {
      const tex = loader.load(p.image);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const mat = new THREE.ShaderMaterial({
        vertexShader: PANEL_VERT,
        fragmentShader: PANEL_FRAG,
        side: THREE.DoubleSide,
        uniforms: {
          uTex: { value: tex }, uTime: uniforms.uTime, uAccent: uniforms.uAccent,
          uVel: { value: 0 }, uReveal: { value: 0 }, uActive: { value: 0 }, uR: { value: R },
        },
      });
      const holder = new THREE.Group();
      holder.rotation.y = i * STEP;
      const mesh = new THREE.Mesh(panelGeo, mat);
      mesh.position.z = R;
      mesh.userData.index = i;
      holder.add(mesh);
      for (const y of [PANEL_H / 2 + 0.06, -PANEL_H / 2 - 0.06]) {
        const c = new THREE.Mesh(clampGeo, clampMat);
        c.position.set(0, y, R - 0.02);
        holder.add(c);
      }
      spin.add(holder);
      return { mesh, mat, clamps: holder.children.slice(1) };
    });

    // แกนกลาง
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 24),
      new THREE.ShaderMaterial({
        vertexShader: CORE_VERT, fragmentShader: CORE_FRAG, transparent: true, depthWrite: false,
        uniforms: { uTime: uniforms.uTime, uAccent: uniforms.uAccent },
      })
    );
    scene.add(core);

    // ฝุ่นอนุภาค
    const COUNT = 1400;
    const pos = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = R * (0.75 + Math.random() * 0.9);
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.4;
      pos[i * 3 + 2] = Math.sin(a) * r;
      seed[i] = Math.random();
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const dustMat = new THREE.ShaderMaterial({
      vertexShader: DUST_VERT, fragmentShader: DUST_FRAG, transparent: true, depthWrite: false,
      uniforms: { uTime: uniforms.uTime, uAccent: uniforms.uAccent, uSize: { value: 26 * renderer.getPixelRatio() } },
    });
    scene.add(new THREE.Points(dustGeo, dustMat));

    // ขนาด
    let narrow = false;
    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      narrow = w < 900;
      camera.fov = narrow ? 48 : 34;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    // คลิกแผ่นด้านหน้าเพื่อเปิดลิงก์ของโปรเจกต์ (ถ้ามี)
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = (e) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const h = ray.intersectObjects(panels.map((p) => p.mesh))[0];
      if (!h) return null;
      const i = h.object.userData.index;
      return panels[i].mat.uniforms.uActive.value > 0.6 && projects[i].links[0] ? projects[i].links[0].href : null;
    };
    const onClick = (e) => { const url = hit(e); if (url) window.open(url, "_blank", "noopener"); };
    const onMove = (e) => { canvas.style.cursor = hit(e) ? "pointer" : ""; };
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("pointermove", onMove);

    // วาดเฉพาะตอนมองเห็น
    let visible = false, raf = 0;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(canvas);

    const clock = new THREE.Clock();
    let ps = 0, vs = 0, drift = 0, lastActive = -1, lastOverview = null;
    const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();

    function tick() {
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.elapsedTime;
      uniforms.uTime.value = time;

      ps += (progress.current - ps) * Math.min(1, dt * 6);
      const vTarget = Math.max(-1, Math.min(1, velocity.current / 2500));
      vs += (vTarget - vs) * Math.min(1, dt * 5);
      velocity.current *= 0.9;

      // ลำดับแผ่น: focus เป็นค่าต่อเนื่อง 0..N-1
      const span = (OUTRO - INTRO) / N;
      const focus = Math.max(0, Math.min(N - 1, (ps - INTRO) / span - 0.35));
      const out = smooth(OUTRO, 1, ps);
      const intro = smooth(0, INTRO, ps);

      panels.forEach((p, i) => {
        const reveal = clamp01((ps - INTRO - i * span) / (span * 0.6));
        p.mat.uniforms.uReveal.value = Math.max(reveal, out);
        const near = 1 - Math.min(1, Math.abs(focus - i));
        p.mat.uniforms.uActive.value = lerp(near, 0.85, out);
        p.mat.uniforms.uVel.value = vs;
        const s = smooth(0, 0.4, Math.max(reveal, out));
        p.clamps.forEach((c) => c.scale.setScalar(s));
      });

      // หมุนวงให้แผ่นที่ focus อยู่ด้านหน้า แล้วหมุนช้า ๆ ต่อเมื่อเข้าช่วง overview
      // drift = การหมุนเพิ่มช่วง overview; พอเลื่อนกลับขึ้นไปจะคืนค่าเข้าหามุมที่ใกล้ที่สุด (ทวีคูณ 2π)
      if (out > 0.001) drift += dt * 0.14 * out;
      else drift += (Math.round(drift / (Math.PI * 2)) * Math.PI * 2 - drift) * Math.min(1, dt * 4);
      spin.rotation.y = -focus * STEP - drift;
      rig.rotation.x = lerp(0.1, 0.22, out);
      rig.scale.setScalar(lerp(0.8, 1, intro));
      innerRing.rotation.z = time * 0.2;
      innerRing.rotation.x = Math.PI / 2 + Math.sin(time * 0.4) * 0.15;
      core.rotation.y = time * 0.15;

      // กล้อง: ใกล้ (แผ่นด้านหน้าอยู่ขวามือ ข้อความอยู่ซ้าย) → ถอยขึ้นด้านบนตอนท้าย
      const sideX = narrow ? 0 : -2.1;
      camPos.set(lerp(sideX, sideX * 0.5, out), lerp(1.5, 3.4, out), lerp(R + (narrow ? 8.5 : 6.6), narrow ? 15 : 12.5, out));
      camLook.set(lerp(sideX, sideX * 0.5, out), lerp(narrow ? -0.8 : -0.1, narrow ? -1.2 : -0.35, out), lerp(R * 0.4, 0, out));
      camera.position.copy(camPos);
      camera.lookAt(camLook);

      renderer.render(scene, camera);

      const a = Math.round(focus);
      if (a !== lastActive) { lastActive = a; setActive(a); }
      const ov = out > 0.5;
      if (ov !== lastOverview) { lastOverview = ov; setOverview(ov); }

      if (visible) raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        o.geometry?.dispose();
        const m = o.material;
        if (m) { m.uniforms?.uTex?.value?.dispose(); m.dispose(); }
      });
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  const p = projects[active];
  return (
    <section id="work" className="orbit" ref={sectionRef}>
      <canvas ref={canvasRef} className="orbit-canvas" />
      <div className="orbit-ui">
        <div className="orbit-head">
          <span className="mono sec-index">02</span>
          <h2>{ui("work.title")}</h2>
        </div>

        {!overview ? (
          <div className="orbit-info" key={`p${active}`}>
            <p className="mono orbit-count">{String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}</p>
            <p className="mono card-kicker">{t(p.kicker)}</p>
            <h3>{p.title}</h3>
            <p className="orbit-summary">{t(p.summary)}</p>
            <p className="orbit-body">{t(p.body)}</p>
            <div className="orbit-meta">
              <span className={`status s-${p.status === "proposal" ? "prop" : p.status}`}>{ui(`status.${p.status}`)}</span>
              {p.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="orbit-link">{t(l.label)} ↗</a>
              ))}
            </div>
          </div>
        ) : (
          <div className="orbit-info" key="overview">
            <p className="mono orbit-count">{String(N).padStart(2, "0")} / {String(N).padStart(2, "0")}</p>
            <h3>{ui("orbit.allTitle")}</h3>
            <p className="orbit-body">{ui("orbit.allBody")}</p>
            <a href="#projects" className="btn btn-ghost">{ui("orbit.details")} ↓</a>
          </div>
        )}

        <div className="orbit-rail" aria-hidden="true">
          {projects.map((_, i) => (
            <span key={i} className={i === active && !overview ? "on" : overview ? "all" : ""} />
          ))}
          <em className="mono">{ui("orbit.hint")}</em>
        </div>
      </div>
    </section>
  );
}
