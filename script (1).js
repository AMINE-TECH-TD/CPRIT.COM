"use strict";
/* Textes ajoutés pour la nouvelle navigation (fusionnés avec translations.js) */
const extra = {
  fr: { navResources: "Ressources ▾", navReports: "Rapports d'activités", studentLogin: "Accéder à mon espace", reportsText: "Consultez les rapports officiels du CPRIT.", reportsLink: "Lire le rapport 2021–2025 →" },
  en: { navResources: "Resources ▾", navReports: "Activity Reports", studentLogin: "Access my space", reportsText: "Read CPRIT's official reports.", reportsLink: "Read the 2021–2025 report →" },
  ar: { navResources: "الموارد ▾", navReports: "تقارير الأنشطة", studentLogin: "الدخول إلى فضائي", reportsText: "اطلع على التقارير الرسمية للمركز.", reportsLink: "قراءة تقرير 2021–2025 ←" }
};
Object.keys(extra).forEach(l => Object.assign(translations[l], extra[l]));

const subs = {
  fr: { navResources:"Ressources", subWelcome:"Bienvenue", subLatest:"Communiqué et message du DG", subPresentation:"Présentation", subTrack:"Parcours de formation", subSkills:"Compétences visées", subTrainers:"Espace formateurs", subStudents:"Espace futurs enseignants", subNewsTop:"À la une", subContactUs:"Nous contacter", subRegister:"Inscription" },
  en: { navResources:"Resources", subWelcome:"Welcome", subLatest:"Announcement and Director's message", subPresentation:"Overview", subTrack:"Training programme", subSkills:"Target skills", subTrainers:"Trainers' area", subStudents:"Future teachers' area", subNewsTop:"Highlights", subContactUs:"Contact us", subRegister:"Registration" },
  ar: { navResources:"الموارد", subWelcome:"مرحباً", subLatest:"الإعلان ورسالة المدير", subPresentation:"التعريف", subTrack:"مسار التكوين", subSkills:"الكفاءات المستهدفة", subTrainers:"فضاء المكونين", subStudents:"فضاء المعلمين", subNewsTop:"الأبرز", subContactUs:"اتصل بنا", subRegister:"التسجيل" }
};
Object.keys(subs).forEach(l => Object.assign(translations[l], subs[l]));

const titles = { fr: "CPRIT | Centre pédagogique régional de l'ICESCO au Tchad", en: "CPRIT | ICESCO Regional Pedagogical Centre in Chad", ar: "CPRIT | المركز التربوي الإقليمي للإيسيسكو في تشاد" };

function setLanguage(lang) {
  const l = translations[lang] ? lang : "fr", dict = translations[l];
  document.documentElement.lang = l;
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.dataset.i18n;
    if (k in dict) el.innerHTML = dict[k];
  });
  document.title = titles[l];
  document.getElementById("languageSelect").value = l;
  try { localStorage.setItem("cprit_language", l); } catch (e) {}
}
window.CPRITLanguage = { get: () => { try { return localStorage.getItem("cprit_language") || "fr"; } catch (e) { return "fr"; } }, set: setLanguage };

document.addEventListener("DOMContentLoaded", () => {
  setLanguage(window.CPRITLanguage.get());
  document.getElementById("languageSelect").addEventListener("change", e => setLanguage(e.target.value));
  document.getElementById("year").textContent = new Date().getFullYear();
  const nav = document.getElementById("mainNav"), tg = document.getElementById("menuToggle");
  tg.addEventListener("click", () => tg.setAttribute("aria-expanded", nav.classList.toggle("open")));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
  const drops = document.querySelectorAll(".dropdown");
  drops.forEach(d => d.querySelector(".drop-btn").addEventListener("click", () => {
    const was = d.classList.contains("open");
    drops.forEach(x => x.classList.remove("open"));
    if (!was) d.classList.add("open");
  }));
  document.addEventListener("click", e => { if (!e.target.closest(".dropdown")) drops.forEach(x => x.classList.remove("open")); });
  drops.forEach(d => d.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { drops.forEach(x => x.classList.remove("open")); nav.classList.remove("open"); })));

  /* DIAPORAMA DES ACTUALITÉS */
  const sl = document.getElementById("slider");
  if (sl) {
    const track = sl.querySelector(".slides"), n = track.children.length, dots = sl.querySelector(".dots");
    let i = 0, timer, x0 = null;
    for (let k = 0; k < n; k++) { const b = document.createElement("button"); b.setAttribute("aria-label", "Photo " + (k + 1)); b.onclick = () => { go(k); restart(); }; dots.appendChild(b); }
    function go(k) { i = (k + n) % n; track.style.transform = "translateX(-" + i * 100 + "%)"; [...dots.children].forEach((d, j) => d.classList.toggle("on", j === i)); }
    function restart() { clearInterval(timer); timer = setInterval(() => go(i + 1), 4000); }
    sl.querySelector(".prev").onclick = () => { go(i - 1); restart(); };
    sl.querySelector(".next").onclick = () => { go(i + 1); restart(); };
    sl.addEventListener("mouseenter", () => clearInterval(timer));
    sl.addEventListener("mouseleave", restart);
    sl.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    sl.addEventListener("touchend", e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) { go(i + (d < 0 ? 1 : -1)); restart(); } x0 = null; });
    go(0); restart();
  }
});
