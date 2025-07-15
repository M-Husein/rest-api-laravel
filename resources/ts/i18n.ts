import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi, { HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next } from "react-i18next";

const LANGS = ["id", "en"];

i18n
  .use(HttpApi)
  /** @DOCS : https://github.com/i18next/i18next-browser-languageDetector */
  .use(LanguageDetector) // if not use this lng not store in localStorage
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    // debug: import.meta.env.DEV, // !import.meta.env.PROD, // import.meta.env.MODE === 'development',
    // if use `lng` lng not store in localStorage
    // lng: 'en', // if using a language detector, do not define the lng option
    // lng: document.documentElement.lang,
    supportedLngs: LANGS,
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    ns: ["common"],
    defaultNS: "common",
    fallbackLng: LANGS,
    // partialBundledLanguages: true, // CUSTOM
    // resources: {}, // CUSTOM
  });

export default i18n;

// (async () => {
//   const LANG_KEY = localStorage.getItem('i18nextLng') || 'en';
//   const resources = await import(`./locales/${LANG_KEY}/common.json`);

//   i18n
//     // .use(Backend)
//     .use(detector)
//     .use(initReactI18next)
//     .init({
//       resources: { [LANG_KEY]: resources.default },
//       lng: LANG_KEY,

//       supportedLngs: ["id", "en"],
//       // backend: {
//       //   loadPath: "/locales/{{lng}}/{{ns}}.json",
//       // },
//       // ns: ["common"],
//       // defaultNS: "common",
//       fallbackLng: ["id", "en"],
//     });
// })();
