import { useEffect, useRef } from "react";

// พื้นหลัง WebGL แบบเขียน shader เอง: domain-warped fBm + contour lines ที่ตอบสนองต่อเมาส์และการเลื่อนหน้า
const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uLight;   // 0 = โหมดมืด, 1 = โหมดสว่าง (ค่อย ๆ เปลี่ยนระหว่างกัน)

float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++){ v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m  = (uMouse - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.035;

  vec2 p = uv * 1.5 + vec2(0.0, uScroll * 0.8);
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + 1.5 * t),
                fbm(p + 3.0 * q + vec2(8.3, 2.8)));
  float f = fbm(p + 2.5 * r);

  float d = length(uv - m);
  f += 0.22 * exp(-d * d * 7.0);

  vec3 ink   = vec3(0.027, 0.031, 0.047);
  vec3 deep  = vec3(0.055, 0.150, 0.165);
  vec3 mint  = vec3(0.486, 0.961, 0.784);
  vec3 amber = vec3(1.000, 0.710, 0.280);

  vec3 col = mix(ink, deep, smoothstep(0.25, 0.85, f));
  col = mix(col, mint * 0.5, smoothstep(0.6, 1.0, f) * 0.6);
  col += amber * 0.16 * smoothstep(0.6, 1.05, length(r)) * smoothstep(0.5, 0.9, f);

  float c = abs(fract(f * 10.0) - 0.5);
  col += mint * 0.07 * smoothstep(0.05, 0.0, c) * smoothstep(0.35, 0.8, f);

  col *= 1.0 - 0.35 * dot(uv * 0.85, uv * 0.85);

  // โหมดสว่าง: ลายเดียวกัน แต่เป็นหมึกจาง ๆ บนกระดาษ
  vec3 paper = vec3(0.957, 0.965, 0.953);
  vec3 lc = mix(paper, vec3(0.870, 0.940, 0.915), smoothstep(0.25, 0.85, f));
  lc = mix(lc, vec3(0.700, 0.895, 0.825), smoothstep(0.6, 1.0, f) * 0.55);
  lc = mix(lc, vec3(1.000, 0.880, 0.700), 0.35 * smoothstep(0.6, 1.05, length(r)) * smoothstep(0.5, 0.9, f));
  lc -= vec3(0.10, 0.04, 0.06) * smoothstep(0.05, 0.0, c) * smoothstep(0.35, 0.8, f);
  lc *= 1.0 - 0.06 * dot(uv, uv);

  col = mix(col, lc, uLight);
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * mix(0.022, 0.012, uLight);
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function ShaderBackground({ theme = "dark" }) {
  const ref = useRef(null);
  const lightTarget = useRef(theme === "light" ? 1 : 0);
  const redraw = useRef(() => {});

  useEffect(() => {
    lightTarget.current = theme === "light" ? 1 : 0;
    redraw.current();
  }, [theme]);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) {
      canvas.classList.add("no-webgl");
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // สามเหลี่ยมเดียวคลุมทั้งจอ (เร็วกว่า quad 2 สามเหลี่ยมเล็กน้อย)
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uScroll = gl.getUniformLocation(prog, "uScroll");
    const uLight = gl.getUniformLocation(prog, "uLight");
    let light = lightTarget.current;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // render ที่ครึ่งความละเอียดแล้วให้ CSS ขยาย: ลาย noise นุ่มอยู่แล้ว แต่ประหยัด fragment work ~4 เท่า
    const SCALE = 0.5;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5) * SCALE;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5) * SCALE;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    mouse.x = mouse.tx = canvas.width * 0.7;
    mouse.y = mouse.ty = canvas.height * 0.6;

    const onMove = (e) => {
      mouse.tx = e.clientX * dpr;
      mouse.ty = (window.innerHeight - e.clientY) * dpr; // gl_FragCoord เริ่มที่มุมล่างซ้าย
    };

    let raf = 0;
    const start = performance.now();
    const draw = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      gl.uniform1f(uTime, reduce ? 20 : (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, max > 0 ? window.scrollY / max : 0);
      light = reduce ? lightTarget.current : light + (lightTarget.current - light) * 0.08;
      gl.uniform1f(uLight, light);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) draw();
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    if (reduce) window.addEventListener("scroll", draw, { passive: true });
    // โหมด reduced-motion ไม่มี loop จึงต้องวาดใหม่เองเมื่อเปลี่ยนธีม
    redraw.current = () => { if (reduce) draw(); };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", draw);
      document.removeEventListener("visibilitychange", onVis);
      redraw.current = () => {};
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas ref={ref} className="bg-canvas" aria-hidden="true" />;
}
