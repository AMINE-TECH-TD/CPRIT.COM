"use strict";
/* Sécurité : le site fonctionne même si T.js est absent ou incomplet */
const T = (typeof translations !== "undefined" && translations) || {};
["fr","en","ar"].forEach(l => { T[l] = T[l] || {}; });

/* Textes ajoutés pour la nouvelle navigation (fusionnés avec T.js) */
const extra = {
  fr: { navResources: "Ressources ▾", navReports: "Rapports d'activités", studentLogin: "Accéder à mon espace", reportsText: "Consultez les rapports officiels du CPRIT.", reportsLink: "Lire le rapport 2021–2025 →" },
  en: { navResources: "Resources ▾", navReports: "Activity Reports", studentLogin: "Access my space", reportsText: "Read CPRIT's official reports.", reportsLink: "Read the 2021–2025 report →" },
  ar: { navResources: "الموارد ▾", navReports: "تقارير الأنشطة", studentLogin: "الدخول إلى فضائي", reportsText: "اطلع على التقارير الرسمية للمركز.", reportsLink: "قراءة تقرير 2021–2025 ←" }
};
Object.keys(extra).forEach(l => Object.assign(T[l], extra[l]));

const subs = {
  fr: { navResources:"Ressources", subWelcome:"Bienvenue", subLatest:"Communiqué et message du DG", subPresentation:"Présentation", subTrack:"Parcours de formation", subSkills:"Compétences visées", subTrainers:"Espace formateurs", subStudents:"Espace futurs enseignants", subNewsTop:"À la une", subContactUs:"Nous contacter", subRegister:"Inscription" },
  en: { navResources:"Resources", subWelcome:"Welcome", subLatest:"Announcement and Director's message", subPresentation:"Overview", subTrack:"Training programme", subSkills:"Target skills", subTrainers:"Trainers' area", subStudents:"Future teachers' area", subNewsTop:"Highlights", subContactUs:"Contact us", subRegister:"Registration" },
  ar: { navResources:"الموارد", subWelcome:"مرحباً", subLatest:"الإعلان ورسالة المدير", subPresentation:"التعريف", subTrack:"مسار التكوين", subSkills:"الكفاءات المستهدفة", subTrainers:"فضاء المكونين", subStudents:"فضاء المعلمين", subNewsTop:"الأبرز", subContactUs:"اتصل بنا", subRegister:"التسجيل" }
};
Object.keys(subs).forEach(l => Object.assign(T[l], subs[l]));

Object.assign(T.en, { contestTag:"OFFICIAL ANNOUNCEMENT", contestTitle:"Entrance competition launch — Thursday, 19 November 2026", contestText:"CPRIT announces the launch of its entrance competition on Thursday, 19 November 2026.", reentryTitle:"Start of the academic year:", reentryText:"The academic year is scheduled to begin in December 2026. Practical information will be officially communicated by CPRIT.", directorTag:"MESSAGE FROM THE DIRECTOR GENERAL", directorTitle:"A message to future candidates", directorMessage:"On the occasion of the competition launch on Thursday, 19 November 2026, I extend my encouragement to all candidates. This is an important step in our commitment to training future primary school teachers. CPRIT is preparing to welcome the new class in December 2026. Together, let us make quality education a national priority.", directorName:"Mr Youssouf Hassane Taha", directorRole:"Director General of CPRIT" });
Object.assign(T.ar, { contestTag:"إعلان رسمي", contestTitle:"إطلاق مسابقة القبول — الخميس 19 نوفمبر 2026", contestText:"يعلن المركز عن إطلاق مسابقة القبول يوم الخميس 19 نوفمبر 2026.", reentryTitle:"بداية السنة الدراسية:", reentryText:"من المقرر أن تبدأ السنة الدراسية في ديسمبر 2026. وسيعلن المركز رسمياً عن المعلومات العملية.", directorTag:"رسالة المدير العام", directorTitle:"رسالة إلى المترشحين", directorMessage:"بمناسبة إطلاق المسابقة يوم الخميس 19 نوفمبر 2026، أتقدم بالتشجيع إلى جميع المترشحات والمترشحين. وتمثل هذه الخطوة تقدماً مهماً في التزامنا بتكوين معلمي التعليم الابتدائي. ويستعد المركز لاستقبال الدفعة الجديدة في ديسمبر 2026. معاً، لنجعل جودة التعليم أولوية وطنية.", directorName:"السيد يوسف حسن طه", directorRole:"المدير العام للمركز" });
Object.assign(T.fr, { newsPhotosTitle:"Le CPRIT en actualités", subNewsPhotos:"Actualités en images" });
Object.assign(T.en, { newsPhotosTitle:"CPRIT in the news", subNewsPhotos:"News in pictures" });
Object.assign(T.ar, { newsPhotosTitle:"المركز في الأخبار", subNewsPhotos:"الأخبار بالصور" });
Object.assign(T.fr, { subMail:"Messagerie du personnel", subAdmin:"Espace administration" });
Object.assign(T.en, { subMail:"Staff mailbox", subAdmin:"Administration area" });
Object.assign(T.ar, { subMail:"بريد الموظفين", subAdmin:"فضاء الإدارة" });
Object.assign(T.en, {"subDates": "Key dates", "subFaq": "FAQ", "subLinks": "Useful links", "datesLabel": "KEY DATES", "datesTitle": "Admissions calendar", "date1": "19 November 2026", "date1T": "Launch of the entrance competition", "date2": "December 2026", "date2T": "Start of the training year", "date2P": "Practical information will be officially announced by CPRIT.", "faqLabel": "FAQ", "faqTitle": "Your questions about CPRIT", "faq1q": "Who can apply?", "faq1a": "Holders of the baccalaureate who wish to become primary school teachers.", "faq2q": "How long is the training?", "faq2a": "Two years: the first focuses on languages (French, Arabic and English), the second on pedagogical and professional training.", "faq3q": "How do I apply?", "faq3a": "Through the registration form on this website. Each application is reviewed and approved by CPRIT.", "faq4q": "When does the training year start?", "faq4a": "It is scheduled for December 2026. CPRIT will officially announce the practical details.", "faq5q": "How can I contact the Centre?", "faq5a": "By phone or WhatsApp on 00235 66 20 97 96, by email at isescotchad@yahoo.com, or at Rue de 30M, Quartier Repo IV, N'Djamena.", "linksLabel": "USEFUL LINKS", "linksTitle": "Official websites", "linksIntro": "Quick access to institutions linked to education in Chad.", "link1Name": "Ministry of National Education and Bilingualism", "link2Name": "Ministry of the Civil Service", "linkVisit": "Visit the website →", "linkSoon": "Link coming soon", "contactRoute": "Get directions"});
Object.assign(T.ar, {"subDates": "تواريخ مهمة", "subFaq": "أسئلة شائعة", "subLinks": "روابط مفيدة", "datesLabel": "تواريخ مهمة", "datesTitle": "رزنامة القبول", "date1": "19 نوفمبر 2026", "date1T": "إطلاق مسابقة القبول", "date2": "ديسمبر 2026", "date2T": "بداية السنة التكوينية", "date2P": "سيعلن المركز رسمياً عن المعلومات العملية.", "faqLabel": "أسئلة شائعة", "faqTitle": "أسئلتكم حول المركز", "faq1q": "من يمكنه الترشح؟", "faq1a": "الحاصلون على شهادة البكالوريا الراغبون في أن يصبحوا معلمين في المرحلة الابتدائية.", "faq2q": "كم مدة التكوين؟", "faq2a": "سنتان: الأولى مخصصة للغات (الفرنسية والعربية والإنجليزية) والثانية للتكوين التربوي والمهني.", "faq3q": "كيف أسجل؟", "faq3a": "عبر استمارة التسجيل في هذا الموقع. يخضع كل طلب للدراسة والموافقة من قبل المركز.", "faq4q": "متى تبدأ السنة التكوينية؟", "faq4a": "من المقرر أن تبدأ في ديسمبر 2026. وسيعلن المركز رسمياً عن التفاصيل العملية.", "faq5q": "كيف أتصل بالمركز؟", "faq5a": "عبر الهاتف أو واتساب على 00235 66 20 97 96، أو بالبريد الإلكتروني isescotchad@yahoo.com، أو في العنوان: شارع 30M، حي ريبو 4، نجامينا.", "linksLabel": "روابط مفيدة", "linksTitle": "المواقع الرسمية", "linksIntro": "وصول سريع إلى المؤسسات المرتبطة بالتعليم في تشاد.", "link1Name": "وزارة التربية الوطنية والثنائية اللغوية", "link2Name": "وزارة الوظيفة العمومية", "linkVisit": "زيارة الموقع ←", "linkSoon": "الرابط قريباً", "contactRoute": "الاتجاهات"});
Object.assign(T.en, {"link3Name": "Ministry of Higher Education, Scientific Research and Vocational Training", "link4Name": "Ministry of Youth and Sports", "subIT": "IT area", "postsLabel": "PUBLICATIONS", "postsTitle": "Latest publications", "readMore": "Read more", "readLess": "Show less"});
Object.assign(T.ar, {"link3Name": "وزارة التعليم العالي والبحث العلمي والتكوين المهني", "link4Name": "وزارة الشباب والرياضة", "subIT": "فضاء تقنية المعلومات", "postsLabel": "المنشورات", "postsTitle": "آخر المنشورات", "readMore": "اقرأ المزيد", "readLess": "عرض أقل"});
Object.assign(T.fr, { subIT:"Espace IT" });
const titles = { fr: "CPRIT | Centre pédagogique régional de l'ICESCO au Tchad", en: "CPRIT | ICESCO Regional Pedagogical Centre in Chad", ar: "CPRIT | المركز التربوي الإقليمي للإيسيسكو في تشاد" };

function setLanguage(lang) {
  const l = T[lang] ? lang : "fr", dict = T[l];
  document.documentElement.lang = l;
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    if (el._fr === undefined) el._fr = el.innerHTML;
    const k = el.dataset.i18n;
    el.innerHTML = (k in dict) ? dict[k] : el._fr;
  });
  document.title = titles[l];
  document.getElementById("languageSelect").value = l;
  try { localStorage.setItem("cprit_language", l); } catch (e) {}
}
window.CPRITLanguage = { get: () => { try { return localStorage.getItem("cprit_language") || "fr"; } catch (e) { return "fr"; } }, set: setLanguage };

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("mainNav"), tg = document.getElementById("menuToggle");
  const yr = document.getElementById("year"); if (yr) yr.textContent = new Date().getFullYear();

  /* MENU */
  tg.addEventListener("click", () => tg.setAttribute("aria-expanded", nav.classList.toggle("open")));
  const drops = document.querySelectorAll(".dropdown");
  drops.forEach(d => d.querySelector(".drop-btn").addEventListener("click", () => {
    const was = d.classList.contains("open");
    drops.forEach(x => x.classList.remove("open"));
    if (!was) d.classList.add("open");
  }));
  document.addEventListener("click", e => { if (!e.target.closest(".dropdown")) drops.forEach(x => x.classList.remove("open")); });
  nav.querySelectorAll(".drop-menu a").forEach(a => a.addEventListener("click", () => { drops.forEach(x => x.classList.remove("open")); nav.classList.remove("open"); }));

  /* DIAPORAMAS AUTOMATIQUES (tous les blocs .slider) */
  document.querySelectorAll(".slider").forEach(sl => {
    const track = sl.querySelector(".slides"), n = track.children.length, dots = sl.querySelector(".dots");
    let i = 0, timer = null, x0 = null;
    const go = k => { i = (k + n) % n; track.style.transform = "translateX(-" + (i * 100) + "%)"; [...dots.children].forEach((d, j) => d.classList.toggle("on", j === i)); };
    const restart = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 3500); };
    for (let k = 0; k < n; k++) { const b = document.createElement("button"); b.setAttribute("aria-label", "Photo " + (k + 1)); b.addEventListener("click", () => { go(k); restart(); }); dots.appendChild(b); }
    sl.querySelector(".prev").addEventListener("click", () => { go(i - 1); restart(); });
    sl.querySelector(".next").addEventListener("click", () => { go(i + 1); restart(); });
    sl.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    sl.addEventListener("touchend", e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) { go(i + (d < 0 ? 1 : -1)); restart(); } x0 = null; });
    go(0); restart();
  });

  /* LIENS UTILES : ajoutez ici les sites (url) ; sans url, la carte affiche « Lien bientôt disponible » */
  const LIENS = [
    { key: "link1Name", fr: "Ministère de l'Éducation nationale et du Bilinguisme", url: "" },
    { key: "link2Name", fr: "Ministère de la Fonction publique", url: "" },
    { key: "link3Name", fr: "Ministère de l'Enseignement supérieur, de la Recherche scientifique et de la Formation professionnelle", url: "" },
    { key: "link4Name", fr: "Ministère de la Jeunesse et des Sports", url: "" }
  ];
  const lg = document.getElementById("linksGrid");
  if (lg) {
    LIENS.forEach(l => {
      const ok = /^https:\/\//.test(l.url), c = document.createElement(ok ? "a" : "div");
      c.className = "card sm link-card";
      if (ok) { c.href = l.url; c.target = "_blank"; c.rel = "noopener"; }
      const t = document.createElement("h3"); t.dataset.i18n = l.key; t.textContent = l.fr;
      const g = document.createElement("span"); g.className = ok ? "go" : "soon";
      g.dataset.i18n = ok ? "linkVisit" : "linkSoon"; g.textContent = ok ? "Visiter le site →" : "Lien bientôt disponible";
      c.append(t, g); lg.appendChild(c);
    });
  }

  /* BOUTON RETOUR EN HAUT */
  const up = document.getElementById("toTop");
  if (up) {
    window.addEventListener("scroll", () => up.classList.toggle("show", window.scrollY > 600), { passive: true });
    up.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* PUBLICATIONS DE L'ÉQUIPE IT (lues dans Supabase ; la section reste cachée s'il n'y en a pas) */
  const pg = document.getElementById("postsGrid");
  if (pg && window.supabase && typeof SUPABASE_URL !== "undefined") {
    try {
      const origin = new URL(SUPABASE_URL.trim()).origin, cl = window.supabase.createClient(origin, SUPABASE_ANON_KEY.trim());
      cl.from("site_posts").select("id,title,body,image_path,created_at").eq("published", true).order("created_at", { ascending: false }).limit(6)
        .then(({ data }) => {
          if (!data || !data.length) return;
          const lang = document.documentElement.lang || "fr";
          data.forEach(p => {
            const c = document.createElement("article"); c.className = "card post-card";
            if (p.image_path) { const im = document.createElement("img"); im.loading = "lazy"; im.alt = ""; im.src = origin + "/storage/v1/object/public/site-images/" + encodeURIComponent(p.image_path); c.appendChild(im); }
            const d = document.createElement("span"); d.className = "tag"; d.textContent = new Date(p.created_at).toLocaleDateString(lang === "ar" ? "ar" : lang);
            const t = document.createElement("h3"); t.textContent = p.title;
            const b = document.createElement("p"); b.className = "post-body"; b.textContent = p.body;
            c.append(d, t, b);
            if (p.body.length > 220) { b.classList.add("clamp"); const m = document.createElement("button"); m.type = "button"; m.className = "mini"; m.dataset.i18n = "readMore"; m.textContent = "Lire la suite";
              m.addEventListener("click", () => { const o = b.classList.toggle("clamp"); m.dataset.i18n = o ? "readMore" : "readLess"; const w = (window.CPRITLanguage.get && T[window.CPRITLanguage.get()]) || {}; m.textContent = w[m.dataset.i18n] || (o ? "Lire la suite" : "Réduire"); }); c.appendChild(m); }
            pg.appendChild(c);
          });
          document.getElementById("posts").hidden = false;
          try { setLanguage(window.CPRITLanguage.get()); } catch (e) {}
        }).catch(() => {});
    } catch (e) { console.warn("Publications :", e); }
  }

  /* LANGUE (en dernier : une erreur ici ne bloque ni le menu ni le diaporama) */
  try {
    setLanguage(window.CPRITLanguage.get());
    document.getElementById("languageSelect").addEventListener("change", e => setLanguage(e.target.value));
  } catch (err) { console.warn("Langue :", err); }
});
