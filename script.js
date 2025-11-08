// -------------------- Smooth scroll for header links with offset --------------------
(function () {
  const headerPill = document.getElementById('header-pill');
  const headerHeight = () => headerPill ? headerPill.getBoundingClientRect().height + 20 : 70;

  const navLinks = document.querySelectorAll('.main-nav a, .brand');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || (!href.startsWith('#'))) return; // only handle anchors
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      // Animate header pill for feedback
      headerPill?.classList.add('pill-animate');
      setTimeout(() => headerPill?.classList.remove('pill-animate'), 420);

      // Smooth scroll with offset
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight();
      window.scrollTo({ top, behavior: 'smooth' });

      // Move focus for accessibility
      setTimeout(() => {
        const heading = target.querySelector('h2, h1, h3');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      }, 700);
    });
  });

  // Highlight nav links based on scroll position
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const observerOpts = { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const links = document.querySelectorAll(`.main-nav a[href$="#${id}"]`);
      links.forEach(a => a.classList.toggle('active', entry.isIntersecting));
    });
  }, observerOpts);

  sections.forEach(s => io.observe(s));
})();

// -------------------- Reveal Animations --------------------
(function () {
  const sections = document.querySelectorAll('.section');
  const ioOptions = { threshold: 0.15, rootMargin: '0px 0px -10% 0px' };

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, ioOptions);

  sections.forEach(s => io.observe(s));
})();

// -------------------- Footer Year --------------------
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
});

// -------------------- Featured Image Overlay --------------------
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('.featured-img');
  const overlay = document.getElementById('image-overlay');
  const overlayImg = document.getElementById('overlay-img');
  const closeBtn = overlay?.querySelector('.close-btn');

  if (!overlay) return;

  const showOverlay = (src) => {
    overlayImg.src = src;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  const hideOverlay = () => {
    overlay.classList.remove('active');
    setTimeout(() => (overlay.style.display = 'none'), 300);
    document.body.style.overflow = '';
  };

  images.forEach(img => {
    img.addEventListener('click', () => {
      overlay.style.display = 'flex';
      requestAnimationFrame(() => showOverlay(img.src));
    });
  });

  closeBtn?.addEventListener('click', hideOverlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideOverlay();
  });
});

// -------------------- Solar System Scroll Interaction --------------------
document.addEventListener('scroll', () => {
  const section = document.querySelector('.solar-system-section');
  if (!section) return;
  const scrollY = window.scrollY;
  const orbits = document.querySelectorAll('.orbit');
  orbits.forEach((orbit, i) => {
    orbit.style.transform = `translate(-50%, -50%) rotate(${scrollY / (20 + i * 5)}deg)`;
  });
});

// -------------------- Planet Project Popup --------------------
document.addEventListener('DOMContentLoaded', () => {
  const workOverlay = document.getElementById('work-overlay');
  const popupContent = document.getElementById('popup-content');
  const closeBtns = workOverlay?.querySelectorAll('.close-btn');

  const projectDetails = {
    math: {
      title: "Math and Stat",
      desc: "Create a dataset about mobile phone usage and social media activity to determine impacts on learning. Data cleaning, visualization and basic predictive modeling.",
      tags: ["Math", "Statistics"],
      link: "https://670612-bus.my.canva.site/hcu"
    },
    network: {
      title: "Wireless Research",
      desc: "Research and prototype improvements for low-power wireless systems for IoT applications, including performance testing and documentation for academic presentation.",
      tags: ["WLAN", "IoT"],
      link: "https://670612-bus.my.canva.site/group-project"
    },
    environ: {
      title: "EnvironTech — Business Model",
      desc: "Design and prototype a floating platform + retrieval boat system to collect floating debris. Integration with IoT sensors for monitoring and operation.",
      tags: ["IoT", "Prototype"],
      link: "https://670612-bus.my.canva.site/dag3yyiuoyi"
    },
    robotic: {
      title: "OpenHouse — Robotic Arm",
      desc: "Open house event: Build a robotic arm with servos and 3D prints and take care of the remote control car part with the gyroscope used for controlling the robot.",
      tags: ["Code", "Arduino"],
      link: "https://www.hcu.ac.th/event/2671"
    }
  };

  const showPopup = (proj) => {
    popupContent.innerHTML = `
      <h2>${proj.title}</h2>
      <p class="muted">${proj.desc}</p>
      <div class="tags">${proj.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <a href="${proj.link}" target="_blank" class="learnmore" style="margin-top:16px;display:inline-block;">Learn more</a>
    `;
    workOverlay.classList.add('active');
    workOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  const hidePopup = () => {
    workOverlay.classList.remove('active');
    setTimeout(() => (workOverlay.style.display = 'none'), 300);
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.planet').forEach(planet => {
    planet.addEventListener('click', () => {
      const key = planet.dataset.project;
      const proj = projectDetails[key];
      if (proj) showPopup(proj);
    });
  });

  closeBtns?.forEach(btn => btn.addEventListener('click', hidePopup));
  workOverlay?.addEventListener('click', (e) => {
    if (e.target === workOverlay) hidePopup();
  });
});

// ---------- Parallax Starfield Motion ----------
document.addEventListener('scroll', () => {
  const y = window.scrollY;
  const stars = document.querySelector('.stars');
  const twinkle = document.querySelector('.twinkle');
  
  if (stars) {
    stars.style.transform = `translateY(${y * 0.1}px)`;  // เคลื่อนช้า
  }
  if (twinkle) {
    twinkle.style.transform = `translateY(${y * 0.2}px)`; // เคลื่อนเร็วขึ้นนิด
  }
});

// ---------- Parallax Starfield Motion ----------
document.addEventListener('scroll', () => {
  const y = window.scrollY;
  const stars = document.querySelector('.stars');
  const twinkle = document.querySelector('.twinkle');
  const twinkle2 = document.querySelector('.twinkle-2');
  
  if (stars) stars.style.transform = `translateY(${y * 0.1}px)`;
  if (twinkle) twinkle.style.transform = `translateY(${y * 0.15}px)`;
  if (twinkle2) twinkle2.style.transform = `translateY(${y * 0.2}px)`;
});
