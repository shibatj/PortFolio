import { useEffect, useRef, useState } from "react";
import { profile } from "../data.js";
import { useLang } from "../i18n.js";

/*
  ป้ายห้อยคอแบบมีฟิสิกส์ (Verlet integration)
  - สายคล้อง = โซ่ของจุด N จุด ยึดจุดแรกไว้ด้านบน
  - ตัวการ์ด = rigid rod 2 จุด (หมุดบน / ขอบล่าง) ระยะคงที่ = ความสูงการ์ด
  - มุมของการ์ดคำนวณจากเวกเตอร์ หมุดบน → ขอบล่าง
  - ลากได้ / ปล่อยแล้วเหวี่ยงต่อ (Verlet เก็บความเร็วไว้ในตำแหน่งก่อนหน้าโดยอัตโนมัติ)
  - คลิก (ไม่ลาก) = พลิกการ์ด
  - สายยืดหยุ่น: ความยาวพักของสาย (rest length) คูณด้วย stretch
    ระหว่างลาก stretch ตามระยะที่ดึง (สูงสุด MAX_STRETCH เท่า)
    พอปล่อย stretch จะเด้งกลับเป็น 1 ด้วยสปริงแบบ underdamped  x'' = -k(x-1) - c x'
    constraint ที่หดลงจะดึงการ์ดกลับขึ้นไป และ Verlet แปลงการหดนี้เป็นความเร็วให้เอง
*/

const N = 14;          // จำนวนจุดของสาย
const SEG = 18;        // ความยาวต่อช่วง (px)
const CARD_W = 260;
const CARD_H = 372;
const GRAVITY = 2200;  // px/s^2
const DAMP = 0.985;
const ITER = 14;
const MAX_STRETCH = 2.4;   // ยืดได้สูงสุดกี่เท่าของความยาวสาย
const SPRING_K = 90;       // ความแข็งสปริง (1/s^2)
const SPRING_C = 10;       // ความหน่วง  → ζ = c / (2√k) ≈ 0.53 เด้งกลับมีกระดอนนิดเดียว
const MAX_V = 2400;        // จำกัดความเร็วจุด (px/s) กันการ์ดพุ่งหลุดจอตอนสายดีดกลับ

export default function Badge() {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  const strapRef = useRef(null);
  const textRef = useRef(null);
  const [flipped, setFlipped] = useState(false);
  const flipRef = useRef(false);
  flipRef.current = flipped;

  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const anchor = { x: 0, y: -30 };
    const placeAnchor = () => { anchor.x = wrap.clientWidth * 0.5; };
    placeAnchor();

    // เริ่มต้นให้สายเอียงไปด้านข้าง เพื่อให้มีการแกว่งเข้าฉากตอนโหลด
    const startAngle = reduce ? 0 : 0.9;
    const mk = (x, y) => ({ x, y, px: x, py: y });
    const rope = Array.from({ length: N }, (_, i) =>
      mk(anchor.x + Math.sin(startAngle) * i * SEG, anchor.y + Math.cos(startAngle) * i * SEG));
    const top = rope[N - 1];
    const bot = mk(top.x + Math.sin(startAngle) * CARD_H, top.y + Math.cos(startAngle) * CARD_H);

    const drag = { on: false, t: 0, x: 0, y: 0, moved: 0, sx: 0, sy: 0 };
    let rotY = 0, raf = 0, last = performance.now(), acc = 0, prevCx = top.x;
    let stretch = 1, stretchV = 0;
    const ROPE_LEN = (N - 1) * SEG;

    const solve = (a, b, len, aFixed) => {
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.0001;
      const diff = (d - len) / d;
      if (aFixed) { b.x -= dx * diff; b.y -= dy * diff; }
      else {
        a.x += dx * diff * 0.5; a.y += dy * diff * 0.5;
        b.x -= dx * diff * 0.5; b.y -= dy * diff * 0.5;
      }
    };

    // ขยับการ์ดทั้งชิ้นให้จุดที่จับอยู่ตรงกับเมาส์
    const pinCard = () => {
      const gx = top.x + (bot.x - top.x) * drag.t;
      const gy = top.y + (bot.y - top.y) * drag.t;
      const dx = drag.x - gx, dy = drag.y - gy;
      top.x += dx; top.y += dy; bot.x += dx; bot.y += dy;
    };

    const step = (dt) => {
      const g = GRAVITY * dt * dt;
      for (const p of [...rope.slice(1), bot]) {
        let vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
        const sp = Math.hypot(vx, vy), lim = MAX_V * dt;
        if (sp > lim) { vx *= lim / sp; vy *= lim / sp; }
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy + g;
      }
      if (drag.on) {
        // สายต้องยาวเท่าไรถึงจะไปถึงจุดที่จับ → นั่นคือค่า stretch ขณะลาก
        const dx = drag.x - anchor.x, dy = drag.y - anchor.y;
        let d = Math.hypot(dx, dy);
        const max = ROPE_LEN * MAX_STRETCH + drag.t * CARD_H;
        if (d > max) { drag.x = anchor.x + dx / d * max; drag.y = anchor.y + dy / d * max; d = max; }
        const need = (d - drag.t * CARD_H) / ROPE_LEN;
        stretch += (Math.max(1, need) - stretch) * 0.5;
        stretchV = 0;
      } else {
        // สปริงดึงความยาวสายกลับสู่ค่าพัก
        stretchV += (-SPRING_K * (stretch - 1) - SPRING_C * stretchV) * dt;
        stretch = Math.max(0.8, stretch + stretchV * dt);
      }
      const seg = SEG * stretch;
      for (let k = 0; k < ITER; k++) {
        rope[0].x = anchor.x; rope[0].y = anchor.y;
        for (let i = 0; i < N - 1; i++) solve(rope[i], rope[i + 1], seg, i === 0);
        solve(top, bot, CARD_H, false);
        if (drag.on) pinCard();
      }
    };

    const render = () => {
      // สายคล้อง: เส้นโค้งผ่านจุดกึ่งกลางของแต่ละช่วง
      let d = `M ${rope[0].x} ${rope[0].y}`;
      for (let i = 1; i < N - 1; i++) {
        const mx = (rope[i].x + rope[i + 1].x) / 2, my = (rope[i].y + rope[i + 1].y) / 2;
        d += ` Q ${rope[i].x} ${rope[i].y} ${mx} ${my}`;
      }
      d += ` L ${top.x} ${top.y}`;
      strapRef.current.setAttribute("d", d);
      // สายยิ่งยืดยิ่งบาง (ปริมาตรคงที่โดยประมาณ)
      strapRef.current.style.strokeWidth = (22 / Math.sqrt(Math.max(1, stretch))).toFixed(2);
      textRef.current.style.opacity = Math.max(0, 1.6 - stretch).toFixed(2);

      const ang = -Math.atan2(bot.x - top.x, bot.y - top.y);
      const cx = (top.x + bot.x) / 2;
      const v = cx - prevCx; prevCx = cx;
      const target = (flipRef.current ? 180 : 0) + Math.max(-35, Math.min(35, v * 2.2));
      rotY += (target - rotY) * 0.12;
      card.style.transform =
        `translate3d(${top.x - CARD_W / 2}px, ${top.y}px, 0) rotate(${ang}rad) rotateY(${rotY}deg)`;
    };

    const loop = (now) => {
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      const h = 1 / 120;
      while (acc >= h) { step(h); acc -= h; }
      render();
      raf = requestAnimationFrame(loop);
    };

    const local = (e) => {
      const r = wrap.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e) => {
      e.preventDefault();
      try { card.setPointerCapture(e.pointerId); } catch { /* synthetic events */ }
      const p = local(e);
      // หาว่าจับที่ตำแหน่งไหนตามแกนการ์ด (0 = หมุด, 1 = ขอบล่าง)
      const ax = bot.x - top.x, ay = bot.y - top.y;
      const t = ((p.x - top.x) * ax + (p.y - top.y) * ay) / (ax * ax + ay * ay);
      Object.assign(drag, { on: true, t: Math.max(0.05, Math.min(1, t)), x: p.x, y: p.y, sx: p.x, sy: p.y, moved: 0 });
      card.classList.add("grabbing");
    };
    const onMove = (e) => {
      if (!drag.on) return;
      const p = local(e);
      drag.x = p.x; drag.y = p.y;
      drag.moved = Math.max(drag.moved, Math.hypot(p.x - drag.sx, p.y - drag.sy));
    };
    const onUp = () => {
      if (!drag.on) return;
      drag.on = false;
      card.classList.remove("grabbing");
      if (drag.moved < 6) setFlipped((f) => !f);
    };

    card.addEventListener("pointerdown", onDown);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerup", onUp);
    card.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", placeAnchor);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener("pointerdown", onDown);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerup", onUp);
      card.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", placeAnchor);
    };
  }, []);

  const { t, ui, lang } = useLang();
  const name = t(profile.name);
  const [first, ...rest] = name.split(" ");
  const strapText = `${profile.name.en.toUpperCase()}  ✦  AI · HCU  ✦  `.repeat(6);

  return (
    <div className="badge-wrap" ref={wrapRef}>
      <svg className="badge-strap" width="100%" height="100%" aria-hidden="true">
        <defs>
          <linearGradient id="strapGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#0f131b" />
            <stop offset="0.5" stopColor="#1a2230" />
            <stop offset="1" stopColor="#0f131b" />
          </linearGradient>
        </defs>
        <path id="strapPath" ref={strapRef} className="strap-band" />
        <text ref={textRef} className="strap-text" dy="3.5">
          <textPath href="#strapPath" startOffset="0">{strapText}</textPath>
        </text>
      </svg>

      <div
        className="badge-card"
        ref={cardRef}
        style={{ width: CARD_W, height: CARD_H }}
        role="img"
        aria-label={`${name}. ${ui("badge.aria")}`}
        lang={lang}
      >
        <div className="badge-clip" />
        <div className="badge-face badge-front">
          <div className="badge-slot" />
          <div className="badge-head">
            <span className="badge-mark">PA</span>
            <span className="mono">AI · HCU</span>
          </div>
          <div className="badge-photo">
            <img src="/badge-photo.jpg" alt="" draggable="false" />
            <span className="badge-tag mono">PLAYER 1</span>
          </div>
          <div className="badge-name">
            <strong>{first}</strong>
            <span>{rest.join(" ")}</span>
          </div>
          <div className="badge-foot">
            <span className="mono">{t(profile.role)}</span>
            <span className="badge-bars" />
          </div>
        </div>
        <div className="badge-face badge-back">
          <div className="badge-slot" />
          <p className="mono badge-back-k">{ui("badge.hello")}</p>
          <p className="badge-back-name">{t(profile.nickname)}</p>
          <p className="badge-back-txt">{t(profile.tagline)}</p>
          <ul className="mono badge-back-list">
            {profile.facts.slice(0, 4).map((f, i) => <li key={i}><span>{t(f.k)}</span>{t(f.v)}</li>)}
          </ul>
          <p className="mono badge-back-hint">{ui("badge.back")}</p>
        </div>
      </div>
      <p className="badge-hint mono">{ui("badge.hint")}</p>
    </div>
  );
}
