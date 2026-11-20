"use strict";
/* Textes ajoutés pour la nouvelle navigation (fusionnés avec translations.js) */
const extra = {
  fr: { navResources: "Ressources ▾", navReports: "Rapports d'activités", studentLogin: "Accéder à mon espace", reportsText: "Consultez les rapports officiels du CPRIT.", reportsLink: "Lire le rapport 2021–2025 →" },
  en: { navResources: "Resources ▾", navReports: "Activity Reports", studentLogin: "Access my space", reportsText: "Read CPRIT's official reports.", reportsLink: "Read the 2021–2025 report →" },
  ar: { navResources: "الموارد ▾", navReports: "تقارير الأنشطة", studentLogin: "الدخول إلى فضائي", reportsText: "اطلع على التقارير الرسمية للمركز.", reportsLink: "قراءة تقرير 2021–2025 ←" }
};
Object.keys(extra).forEach(l => Object.assign(translations[l], extra[l]));

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
  document.querySelector(".drop-btn").addEventListener("click", e => e.target.parentElement.classList.toggle("open"));
});
