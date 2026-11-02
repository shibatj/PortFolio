import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ShaderBackground from "./components/ShaderBackground.jsx";
import Cursor from "./components/Cursor.jsx";
import Badge from "./components/Badge.jsx";
// three.js หนัก (~500 KB) จึงแยกเป็น chunk ที่โหลดตามหลัง
const WorkOrbit = lazy(() => import("./components/WorkOrbit.jsx"));
import { profile, projects, skills, timeline, awards } from "./data.js";
import { LangContext, useLang, initialLang, initialTheme } from "./i18n.js";

gsap.registerPlugin(ScrollTrigger);

const NAV = ["about", "work", "awards", "skills", "path", "contact"];

const STATUS_CLS = { live: "s-live", dev: "s-dev", proposal: "s-prop" };

// แยกเป็น grapheme (ไม่ใช่ code point) เพื่อให้สระ/วรรณยุกต์ไทยติดกับพยัญชนะ
const seg = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
const graphemes = (s) => (seg ? [...seg.segment(s)].map((x) => x.segment) : [...s]);

function Split({ text, className }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, wi) => (
        <span className="word" key={wi} aria-hidden="true">
          {graphemes(w).map((ch, ci) => (
            <span className="char" key={ci}>{ch}</span>
          ))}
        </span>
      ))}
    </span>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

function Nav({ active, theme, setTheme }) {
  const { lang, setLang, t, ui } = useLang();
  return (
    <header className="nav">
      <a href="#top" className="brand" aria-label={ui("nav.top")}>
        <span className="brand-mark">PA</span>
        <span className="brand-name">{t(profile.nickname)}</span>
      </a>
      <nav>
        {NAV.map((id, i) => (
          <a key={id} href={`#${id}`} className={active === id ? "active" : ""}>
            <span className="mono">0{i + 1}</span> {ui(`nav.${id}`)}
          </a>
        ))}
      </nav>
      <div className="nav-tools">
        <button
          type="button"
          className="seg"
          onClick={() => setLang(lang === "th" ? "en" : "th")}
          aria-label={ui("toggle.lang")}
          title={ui("toggle.lang")}
        >
          <span className={lang === "th" ? "on" : ""}>TH</span>
          <span className={lang === "en" ? "on" : ""}>EN</span>
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={ui(theme === "dark" ? "toggle.toLight" : "toggle.toDark")}
          title={ui(theme === "dark" ? "toggle.toLight" : "toggle.toDark")}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
      <div className="progress"><span className="progress-bar" /></div>
    </header>
  );
}

function Hero() {
  const { t, ui } = useLang();
  const [first, ...rest] = t(profile.name).split(" ");
  return (
    <section className="hero" id="top">
      <div className="hero-text">
        <p className="eyebrow mono hero-in">
          <span className="pulse" /> {t(profile.role)} · {t(profile.school)}
        </p>
        <h1 className="hero-title">
          <Split text={first} className="line" />
          <Split text={rest.join(" ")} className="line outline" />
        </h1>
        <p className="hero-tag hero-in">{t(profile.tagline)}</p>
        <div className="hero-cta hero-in">
          <a href="#work" className="btn btn-solid">{ui("hero.seeWork")}</a>
          <a href={`mailto:${profile.email}`} className="btn btn-ghost">{ui("hero.contact")}</a>
        </div>
      </div>
      <Badge />
      <div className="scroll-hint mono hero-in" aria-hidden="true">{ui("hero.scroll")}<span /></div>
    </section>
  );
}

function SectionHead({ index, title, sub }) {
  return (
    <div className="sec-head" data-reveal>
      <span className="mono sec-index">0{index}</span>
      <h2>{title}</h2>
      {sub && <p className="sec-sub">{sub}</p>}
    </div>
  );
}

function About() {
  const { t, ui } = useLang();
  return (
    <section id="about" className="section">
      <SectionHead index={1} title={ui("about.title")} />
      <div className="about-grid">
        <div className="about-text">
          {profile.about.map((p, i) => <p key={i} data-reveal>{t(p)}</p>)}
        </div>
        <dl className="facts">
          {profile.facts.map((f, i) => (
            <div className="fact" key={i} data-reveal>
              <dt className="mono">{t(f.k)}</dt>
              <dd>{t(f.v)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function ProjectCard({ p, i }) {
  const { t, ui } = useLang();
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <article className="card" onPointerMove={onMove} data-reveal>
      {p.image && (
        <figure className="card-media">
          <img src={p.image} alt={t(p.imageAlt) || p.title} loading="lazy" />
        </figure>
      )}
      <div className="card-top">
        <span className="mono card-num">{String(i + 1).padStart(2, "0")}</span>
        <span className={`status ${STATUS_CLS[p.status]}`}>{ui(`status.${p.status}`)}</span>
      </div>
      <p className="mono card-kicker">{t(p.kicker)}</p>
      <h3>{p.title}</h3>
      <p className="card-summary">{t(p.summary)}</p>
      <p className="card-body">{t(p.body)}</p>
      <ul className="tags">{p.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
      {p.links.length > 0 && (
        <div className="card-links">
          {p.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{t(l.label)} <span aria-hidden="true">↗</span></a>
          ))}
        </div>
      )}
    </article>
  );
}

function Work() {
  const { ui } = useLang();
  return (
    <section id="projects" className="section">
      <SectionHead index={2} title={ui("projects.title")} sub={ui("projects.sub")} />
      <div className="cards">
        {projects.map((p, i) => <ProjectCard key={p.title} p={p} i={i} />)}
      </div>
    </section>
  );
}

function Awards() {
  const { t, ui } = useLang();
  return (
    <section id="awards" className="section">
      <SectionHead index={3} title={ui("awards.title")} sub={ui("awards.sub")} />
      <ol className="awards">
        {awards.map((a, i) => (
          <li key={i} className={`award tier-${a.tier}`} data-reveal>
            <span className="mono award-year">{t(a.year)}</span>
            <div className="award-main">
              <h3>{t(a.title)}</h3>
              <p>{t(a.level)}</p>
            </div>
            <span className="award-result">{t(a.result)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Skills() {
  const { t, ui } = useLang();
  const all = skills.flatMap((g) => g.items.map(t));
  return (
    <section id="skills" className="section">
      <SectionHead index={4} title={ui("skills.title")} />
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...all, ...all].map((s, i) => <span key={i}>{s}<i>✦</i></span>)}
        </div>
      </div>
      <div className="skill-grid">
        {skills.map((g, gi) => (
          <div className="skill-group" key={gi} data-reveal>
            <h3 className="mono">{t(g.group)}</h3>
            <ul>{g.items.map((s, si) => <li key={si}>{t(s)}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Path() {
  const { t, ui } = useLang();
  return (
    <section id="path" className="section">
      <SectionHead index={5} title={ui("path.title")} />
      <ol className="timeline">
        {timeline.map((item, i) => (
          <li key={i} data-reveal>
            <span className="mono t-when">{t(item.when)}</span>
            <div>
              <h3>{t(item.what)}</h3>
              <p className="t-where">{t(item.where)}</p>
              <p className="t-note">{t(item.note)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Contact() {
  const { t, ui } = useLang();
  return (
    <section id="contact" className="section contact">
      <SectionHead index={6} title={ui("contact.title")} />
      <p className="contact-lead" data-reveal>{ui("contact.lead")}</p>
      <a className="contact-mail" href={`mailto:${profile.email}`} data-reveal>{profile.email}</a>
      <div className="contact-links" data-reveal>
        {profile.links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn btn-ghost">{l.label} ↗</a>
        ))}
      </div>
      <footer className="footer mono">
        <span>© {new Date().getFullYear()} {t(profile.name)}</span>
        <span>{ui("footer.built")}</span>
      </footer>
    </section>
  );
}

export default function App() {
  const root = useRef(null);
  const [active, setActive] = useState("");
  const [lang, setLang] = useState(initialLang);
  const [theme, setTheme] = useState(initialTheme);

  // ภาษา: ตั้ง <html lang> (ใช้เลือกฟอนต์ไทยใน CSS) + จำค่าไว้
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
    // ความยาวข้อความเปลี่ยน → ตำแหน่ง trigger เปลี่ยน
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [lang]);

  // ธีม: ตั้ง <html data-theme> + สี address bar บนมือถือ
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f4f6f3" : "#07080c");
  }, [theme]);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.timeline({ defaults: { ease: "expo.out" } })
          .from(".hero-title .char", { yPercent: 115, rotate: 6, duration: 1.3, stagger: 0.035 })
          .from(".hero-in", { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, "-=0.9");

        gsap.utils.toArray("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 40, opacity: 0, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });

        gsap.to(".hero-title", {
          yPercent: -25, opacity: 0.15, ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        });
      }

      gsap.to(".progress-bar", {
        scaleX: 1, ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });

      NAV.forEach((id) => {
        ScrollTrigger.create({
          trigger: `#${id}`, start: "top 50%", end: "bottom 50%",
          onToggle: (st) => st.isActive && setActive(id),
        });
      });
      ScrollTrigger.create({
        trigger: ".hero", start: "top top", end: "bottom 50%",
        onToggle: (st) => st.isActive && setActive(""),
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div ref={root}>
        <ShaderBackground theme={theme} />
        <Cursor />
        <Nav active={active} theme={theme} setTheme={setTheme} />
        <main>
          <Hero />
          <About />
          <Suspense fallback={<section id="work" className="orbit" />}>
            <WorkOrbit theme={theme} />
          </Suspense>
          <Work />
          <Awards />
          <Skills />
          <Path />
          <Contact />
        </main>
      </div>
    </LangContext.Provider>
  );
}
