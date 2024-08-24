import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import zhCN from "../locale/zh-CN.json"
import enUS from "../locale/en-US.json"

await i18next.use(initReactI18next).init({
    lng: navigator.language,
    debug: true,
    resources: {
        "en-US": {
            translation: enUS
        },
        "zh-CN": {
            translation: zhCN
        },
    },
    interpolation: {
        escapeValue: false // react already safes from xss
    }
})
export default i18next.t
