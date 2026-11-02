// แก้เนื้อหาทั้งเว็บได้ที่ไฟล์นี้ไฟล์เดียว
// ข้อความที่ต้องแปลเขียนเป็น { en: "...", th: "..." } ส่วนที่เหมือนกันทั้งสองภาษาใช้ string ธรรมดาได้

export const profile = {
  name: { en: "Phanuwat Arsanok", th: "ภาณุวัฒน์ อาสานอก" },
  nickname: { en: "James", th: "เจมส์" },
  role: { en: "AI Undergraduate", th: "นักศึกษาสาขาปัญญาประดิษฐ์" },
  school: { en: "Huachiew Chalermprakiet University", th: "มหาวิทยาลัยหัวเฉียวเฉลิมพระเกียรติ" },
  tagline: {
    en: "I build things from first principles — machine learning in plain C, expert systems that reason with rules, and small tools that ship.",
    th: "ผมชอบสร้างของจากหลักการพื้นฐาน ตั้งแต่ machine learning ด้วยภาษา C ล้วน expert system ที่ให้เหตุผลด้วยกฎ ไปจนถึงเครื่องมือเล็ก ๆ ที่ใช้งานได้จริง",
  },
  about: [
    {
      en: "I'm James, a third-year Artificial Intelligence student at Huachiew Chalermprakiet University.",
      th: "ผมชื่อเจมส์ นักศึกษาชั้นปีที่ 3 สาขาปัญญาประดิษฐ์ มหาวิทยาลัยหัวเฉียวเฉลิมพระเกียรติ",
    },
    {
      en: "I started from the hardware side with a vocational diploma in computer hardware, then moved into AI. I learn best by building the thing myself: writing neural networks in C without libraries, modelling expert knowledge as semantic networks, and measuring where a system is actually slow before trying to make it fast.",
      th: "ผมเริ่มจากสายฮาร์ดแวร์ด้วยการเรียน ปวส. คอมพิวเตอร์ฮาร์ดแวร์ ก่อนย้ายมาสาย AI ผมเรียนรู้ได้ดีที่สุดเมื่อได้ลงมือสร้างเอง ทั้งเขียน neural network ด้วยภาษา C โดยไม่ใช้ไลบรารี จำลองความรู้ของผู้เชี่ยวชาญเป็น semantic network และวัดให้รู้ก่อนว่าระบบช้าตรงไหนจริง ๆ ก่อนลงมือทำให้เร็วขึ้น",
    },
    {
      en: "Along the way I have competed in multimedia, cloud computing and invention contests, placing 2nd nationally in the multimedia skills competition.",
      th: "ระหว่างทางผมได้ลงแข่งทั้งด้านมัลติมีเดีย คลาวด์คอมพิวติ้ง และสิ่งประดิษฐ์ โดยได้อันดับ 2 ระดับชาติจากการแข่งขันทักษะมัลติมีเดีย",
    },
  ],
  facts: [
    { k: { en: "Year", th: "ชั้นปี" }, v: { en: "3rd · AI major", th: "ปี 3 · สาขา AI" } },
    { k: { en: "GPAX", th: "เกรดเฉลี่ยสะสม" }, v: "3.24" },
    { k: { en: "Focus", th: "ความสนใจ" }, v: "ML · Expert Systems · C" },
    { k: { en: "Languages", th: "ภาษา" }, v: { en: "Thai · English", th: "ไทย · อังกฤษ" } },
    { k: { en: "Based in", th: "อยู่ที่" }, v: { en: "Thailand", th: "ประเทศไทย" } },
  ],
  email: "phanuwat606@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/shibatj" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/phanuwat-arsanok" },
  ],
};

// status: "live" | "dev" | "proposal"
export const projects = [
  {
    title: "frametriage",
    image: "/projects/frametriage.jpg",
    imageAlt: { en: "Concept diagram from the design doc", th: "แผนภาพแนวคิดจากเอกสารออกแบบ" },
    kicker: { en: "Senior project", th: "โปรเจกต์จบ" },
    summary: { en: "GPU bottleneck analyzer for Windows games", th: "ตัววิเคราะห์คอขวด GPU สำหรับเกมบน Windows" },
    body: {
      en: "An external analyzer in pure C17 that reads frame timing from PresentMon and GPU telemetry from NVML to tell whether a game is CPU- or GPU-bound. An auto-tuner is planned as phase two.",
      th: "โปรแกรมวิเคราะห์จากภายนอกที่เขียนด้วย C17 ล้วน อ่านจังหวะเฟรมจาก PresentMon และข้อมูล GPU จาก NVML เพื่อบอกว่าเกมติดคอขวดที่ CPU หรือ GPU ส่วนระบบปรับจูนอัตโนมัติวางแผนไว้ในเฟสที่สอง",
    },
    tags: ["C17", "Win32", "NVML", "PresentMon"],
    status: "dev",
    links: [],
  },
  {
    title: "ML in C",
    image: "/projects/ml-in-c.jpg",
    imageAlt: { en: "Course website, Module 0", th: "หน้าเว็บคอร์ส Module 0" },
    kicker: { en: "Self-study course", th: "คอร์สเรียนด้วยตัวเอง" },
    summary: { en: "Machine learning from scratch in plain C", th: "Machine learning ตั้งแต่ศูนย์ด้วยภาษา C ล้วน" },
    body: {
      en: "Bite-sized Thai lessons that climb from k-NN and linear regression toward MLPs, CNNs and a tiny GPT. Every exercise ships with a starter, a solution and an auto-checker — no libraries.",
      th: "บทเรียนภาษาไทยสั้น ๆ ไล่ตั้งแต่ k-NN และ linear regression ไปจนถึง MLP, CNN และ GPT ขนาดจิ๋ว ทุกแบบฝึกหัดมีโค้ดตั้งต้น เฉลย และตัวตรวจอัตโนมัติ โดยไม่ใช้ไลบรารี",
    },
    tags: ["C", "Machine Learning", "Make", "Web"],
    status: "live",
    links: [{ label: { en: "Open course", th: "เปิดคอร์ส" }, href: "https://ml-in-c-beta.vercel.app" }],
  },
  {
    title: "OneHealth Semantic Network",
    image: "/projects/onehealth.jpg",
    imageAlt: { en: "Live semantic network view", th: "หน้าโครงข่ายความหมายจากเว็บจริง" },
    kicker: { en: "Expert systems", th: "ระบบผู้เชี่ยวชาญ" },
    summary: { en: "Zoonosis knowledge as a reasoning graph", th: "ความรู้เรื่องโรคจากสัตว์สู่คนในรูปกราฟเชิงเหตุผล" },
    body: {
      en: "An interactive Thai flowchart linking causes, diseases and animals through if-then, has-a and is-a relations, with region filters and a printable PDF report.",
      th: "ผังงานภาษาไทยแบบโต้ตอบได้ ที่เชื่อมสาเหตุ โรค และสัตว์ ด้วยความสัมพันธ์ if-then, has-a และ is-a พร้อมตัวกรองตามภาค และรายงาน PDF สำหรับพิมพ์",
    },
    tags: ["Expert Systems", "Semantic Network", "JavaScript"],
    status: "live",
    links: [{ label: { en: "Open site", th: "เปิดเว็บ" }, href: "https://onehealth-semantic-network.vercel.app" }],
  },
  {
    title: "Talat POS",
    image: "/projects/talat-pos.jpg",
    imageAlt: { en: "Register screen with sample shop", th: "หน้าขายของของร้านตัวอย่าง" },
    kicker: { en: "Web app", th: "เว็บแอป" },
    summary: { en: "Point-of-sale for small shops", th: "ระบบขายหน้าร้านสำหรับร้านค้าเล็ก ๆ" },
    body: {
      en: "A single-file POS with a register, automatic stock deduction, sales insights, Thai VAT 7% and PromptPay QR payments.",
      th: "ระบบ POS ในไฟล์เดียว มีหน้าขาย ตัดสต็อกอัตโนมัติ สรุปยอดขาย รองรับ VAT 7% และรับเงินผ่าน QR พร้อมเพย์",
    },
    tags: ["JavaScript", "HTML/CSS", "PromptPay"],
    status: "live",
    links: [{ label: { en: "Open app", th: "เปิดแอป" }, href: "https://talat-pos.vercel.app" }],
  },
  {
    title: "AI Image Detection",
    image: "/projects/ai-image-detection.jpg",
    imageAlt: { en: "Slide from the proposal deck: FFT residual spectra", th: "สไลด์จาก proposal: สเปกตรัม FFT ของ residual" },
    kicker: { en: "ML / DL research", th: "งานวิจัย ML / DL" },
    summary: { en: "Telling real photos from generated ones", th: "แยกภาพถ่ายจริงออกจากภาพที่ AI สร้าง" },
    body: {
      en: "Prototype plan comparing frequency-domain features (FFT, DCT, SRM) as an ML baseline against a small CNN, ResNet-50 and a CLIP linear probe on CIFAKE and GenImage.",
      th: "แผนต้นแบบที่เปรียบเทียบ feature เชิงความถี่ (FFT, DCT, SRM) ซึ่งเป็น baseline ฝั่ง ML กับ CNN ขนาดเล็ก, ResNet-50 และ CLIP linear probe บนชุดข้อมูล CIFAKE และ GenImage",
    },
    tags: ["Computer Vision", "Deep Learning", "Python"],
    status: "proposal",
    links: [],
  },
  {
    title: "Vocal Mix Advisor",
    image: "/projects/vocal-mix.jpg",
    imageAlt: { en: "Proposed system pipeline", th: "ไปป์ไลน์ของระบบที่เสนอ" },
    kicker: "Audio ML",
    summary: { en: "Key, vocal range and mix recommendations", th: "วิเคราะห์คีย์ ช่วงเสียง และแนะนำการมิกซ์" },
    body: {
      en: "Detects a song's key and the singer's range, then recommends vocal EQ, compression and reverb learned from multitrack data.",
      th: "ตรวจคีย์ของเพลงและช่วงเสียงของผู้ร้อง แล้วแนะนำค่า EQ, compression และ reverb สำหรับเสียงร้อง โดยเรียนรู้จากข้อมูลแบบ multitrack",
    },
    tags: ["Audio", "Signal Processing", "Python"],
    status: "proposal",
    links: [],
  },
];

export const skills = [
  {
    group: "AI & ML",
    items: ["Machine Learning", { en: "Neural networks from scratch", th: "Neural network ตั้งแต่ศูนย์" }, "Expert Systems", "Orange Data Mining"],
  },
  { group: { en: "Languages", th: "ภาษาโปรแกรม" }, items: ["C", "Python", "JavaScript", "Java", "HTML / CSS"] },
  { group: "Backend & Cloud", items: ["Firebase", "Supabase", "Docker", "Postman", "Vercel"] },
  {
    group: { en: "Systems & Hardware", th: "ระบบและฮาร์ดแวร์" },
    items: [{ en: "Computer hardware", th: "ฮาร์ดแวร์คอมพิวเตอร์" }, "IoT", "Win32 / NVML", "Git & GitHub"],
  },
];

// ภาษาอังกฤษใช้ ค.ศ. ภาษาไทยใช้ พ.ศ. ตามเรซูเม่
export const awards = [
  {
    year: { en: "2022", th: "2565" },
    title: { en: "Multimedia Skills Competition", th: "การแข่งขันทักษะมัลติมีเดีย" },
    level: { en: "National level", th: "ระดับชาติ" },
    result: { en: "2nd place", th: "อันดับ 2" },
    tier: "top",
  },
  {
    year: { en: "2022", th: "2565" },
    title: { en: "Multimedia Skills Competition", th: "การแข่งขันทักษะมัลติมีเดีย" },
    level: { en: "Northern regional level", th: "ระดับภาคเหนือ" },
    result: { en: "3rd place", th: "อันดับ 3" },
    tier: "top",
  },
  {
    year: { en: "2023", th: "2566" },
    title: { en: "Cloud Computing Management Skills — Cisco", th: "การแข่งขันทักษะการจัดการ Cloud Computing — Cisco" },
    level: { en: "Northern regional level", th: "ระดับภาคเหนือ" },
    result: { en: "2nd place", th: "อันดับ 2" },
    tier: "top",
  },
  {
    year: { en: "2023", th: "2566" },
    title: { en: "Cloud Computing Management Skills — Huawei", th: "การแข่งขันทักษะการจัดการ Cloud Computing — Huawei" },
    level: { en: "National level", th: "ระดับชาติ" },
    result: { en: "Honorable mention · Gold-medal tier", th: "รางวัลชมเชย ระดับเหรียญทอง" },
    tier: "mid",
  },
  {
    year: { en: "2024", th: "2567" },
    title: { en: "I-New Gen Award — invention contest", th: "งานประกวดสิ่งประดิษฐ์ I-New Gen Award" },
    level: {
      en: "Electric motorcycle charger with an AI-based vehicle theft detection system",
      th: "เครื่องชาร์จรถจักรยานยนต์ไฟฟ้า ติดตั้งระบบตรวจจับรถหายด้วย AI",
    },
    result: { en: "Entrant", th: "ผู้เข้าประกวด" },
    tier: "base",
  },
  {
    year: { en: "2026", th: "2569" },
    title: { en: "Startup Thailand League", th: "การแข่งขัน Startup Thailand League" },
    level: { en: "Startup competition", th: "เวทีแข่งขันสตาร์ทอัพ" },
    result: { en: "Competitor", th: "ผู้เข้าแข่งขัน" },
    tier: "base",
  },
];

export const timeline = [
  {
    when: { en: "2024 — present", th: "2567 — ปัจจุบัน" },
    what: { en: "Bachelor's degree, Artificial Intelligence", th: "ปริญญาตรี สาขาปัญญาประดิษฐ์" },
    where: { en: "Huachiew Chalermprakiet University", th: "มหาวิทยาลัยหัวเฉียวเฉลิมพระเกียรติ" },
    note: {
      en: "Currently in year 3 · GPAX 3.24. Coursework includes machine learning and expert systems.",
      th: "กำลังศึกษาชั้นปีที่ 3 · เกรดเฉลี่ยสะสม 3.24 รายวิชาครอบคลุม machine learning และ expert system",
    },
  },
  {
    when: { en: "2022 — 2024", th: "2565 — 2567" },
    what: { en: "Higher Vocational Certificate, Computer Hardware", th: "ปวส. สาขาคอมพิวเตอร์ฮาร์ดแวร์" },
    where: { en: "Nakhon Sawan Technical College", th: "วิทยาลัยเทคนิคนครสวรรค์" },
    note: {
      en: "Vocational diploma focused on computer hardware.",
      th: "ประกาศนียบัตรวิชาชีพชั้นสูง เน้นด้านฮาร์ดแวร์คอมพิวเตอร์",
    },
  },
];
