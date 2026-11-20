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

  /* LANGUE (en dernier : une erreur ici ne bloque ni le menu ni le diaporama) */
  try {
    setLanguage(window.CPRITLanguage.get());
    document.getElementById("languageSelect").addEventListener("change", e => setLanguage(e.target.value));
  } catch (err) { console.warn("Langue :", err); }
});
