import { createContext, useContext } from "react";

// ข้อความ UI ที่ไม่ใช่เนื้อหา (เนื้อหาหลักอยู่ใน data.js)
export const UI = {
  "nav.about": { en: "About", th: "เกี่ยวกับ" },
  "nav.work": { en: "Work", th: "ผลงาน" },
  "nav.awards": { en: "Awards", th: "รางวัล" },
  "nav.skills": { en: "Skills", th: "ทักษะ" },
  "nav.path": { en: "Path", th: "การศึกษา" },
  "nav.contact": { en: "Contact", th: "ติดต่อ" },
  "nav.top": { en: "Back to top", th: "กลับขึ้นด้านบน" },

  "status.live": { en: "Live", th: "ใช้งานได้จริง" },
  "status.dev": { en: "In development", th: "กำลังพัฒนา" },
  "status.proposal": { en: "Proposal", th: "ข้อเสนอโครงการ" },

  "hero.seeWork": { en: "See my work", th: "ดูผลงาน" },
  "hero.contact": { en: "Get in touch", th: "ติดต่อผม" },
  "hero.scroll": { en: "scroll", th: "เลื่อนลง" },

  "about.title": { en: "About", th: "เกี่ยวกับผม" },
  "work.title": { en: "Selected work", th: "ผลงานที่คัดมา" },
  "work.sub": {
    en: "Things I have built, am building, or have scoped out.",
    th: "สิ่งที่สร้างเสร็จแล้ว กำลังสร้าง และที่วางแผนไว้",
  },
  "projects.title": { en: "Project details", th: "รายละเอียดผลงาน" },
  "projects.sub": {
    en: "Everything from the orbit above, with tags and links.",
    th: "ผลงานทั้งหมดจากวงแหวนด้านบน พร้อมแท็กและลิงก์",
  },
  "orbit.allTitle": { en: "All work, one orbit", th: "ผลงานทั้งหมดในวงโคจรเดียว" },
  "orbit.allBody": {
    en: "Six projects across systems programming, machine learning, expert systems and the web.",
    th: "หกโปรเจกต์ ครอบคลุมทั้ง systems programming, machine learning, expert system และเว็บ",
  },
  "orbit.details": { en: "See project details", th: "ดูรายละเอียดผลงาน" },
  "orbit.hint": { en: "keep scrolling to rotate", th: "เลื่อนต่อเพื่อหมุนวงแหวน" },
  "awards.title": { en: "Awards", th: "รางวัลและการแข่งขัน" },
  "awards.sub": {
    en: "Competitions and contests I have taken part in.",
    th: "การแข่งขันและเวทีประกวดที่เคยเข้าร่วม",
  },
  "skills.title": { en: "Skills", th: "ทักษะ" },
  "path.title": { en: "Path", th: "เส้นทางการศึกษา" },
  "contact.title": { en: "Let's talk", th: "คุยกันได้ครับ" },
  "contact.lead": {
    en: "Open to internships, research projects and collaborations in AI and systems.",
    th: "เปิดรับงานฝึกงาน โปรเจกต์วิจัย และการร่วมงานด้าน AI และระบบคอมพิวเตอร์",
  },
  "footer.built": { en: "Built with Vite · React · GSAP · WebGL", th: "สร้างด้วย Vite · React · GSAP · WebGL" },

  "badge.hint": { en: "drag to swing · click to flip", th: "ลากเพื่อเหวี่ยง · คลิกเพื่อพลิก" },
  "badge.hello": { en: "Hello, I'm", th: "สวัสดีครับ ผมชื่อ" },
  "badge.back": { en: "click to flip back", th: "คลิกเพื่อพลิกกลับ" },
  "badge.aria": {
    en: "ID badge. Drag to swing, click to flip.",
    th: "บัตรประจำตัว ลากเพื่อเหวี่ยง คลิกเพื่อพลิก",
  },

  "toggle.lang": { en: "เปลี่ยนเป็นภาษาไทย", th: "Switch to English" },
  "toggle.toLight": { en: "Switch to light mode", th: "เปลี่ยนเป็นโหมดสว่าง" },
  "toggle.toDark": { en: "Switch to dark mode", th: "เปลี่ยนเป็นโหมดมืด" },
};

export const LangContext = createContext({ lang: "en", setLang: () => {} });

// ค่าใน data.js เป็นได้ทั้ง string ธรรมดา หรือ { en, th }
const isPair = (v) => v !== null && typeof v === "object" && !Array.isArray(v) && "en" in v;

export function useLang() {
  const { lang, setLang } = useContext(LangContext);
  const t = (v) => (isPair(v) ? v[lang] ?? v.en : v);
  const ui = (key) => t(UI[key] ?? key);
  return { lang, setLang, t, ui };
}

export function initialLang() {
  const saved = localStorage.getItem("lang");
  if (saved === "en" || saved === "th") return saved;
  return (navigator.language || "").toLowerCase().startsWith("th") ? "th" : "en";
}

export function initialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
