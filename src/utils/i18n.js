import i18next from "i18next";
import { initReactI18next } from "react-i18next";

await i18next.use(initReactI18next).init({
    lng: navigator.language,
    debug: true,
    resources: {
        "en": {
            translation: { "search_placeholder": "Search for songs, albums, artists..." }
        },
        "zh-CN": {
            translation: { "search_placeholder": "搜索音乐、专辑、艺术家..." }
        },
    },
    interpolation: {
        escapeValue: false // react already safes from xss
    }
})
export default i18next.t
