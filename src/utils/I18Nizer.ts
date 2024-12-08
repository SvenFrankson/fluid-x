var supportedLocales = [
    "en",
    "fr",
    "pl",
    "de",
    "nl",
    "pt",
    "it",
    "es"
]

let languages = navigator.languages;
for (let i = 0; i < languages.length; i++) {
    let language = languages[i];
    let languageRoot = language.split("-")[0];
    if (supportedLocales.indexOf(languageRoot) != -1) {
        LOCALE = languageRoot;
        break;
    }
}

class I18Nizer {

    public static GetText(key: string, lang: string): string {
        if (i18nData[key]) {
            if (i18nData[key][lang]) {
                return i18nData[key][lang];
            }
            return i18nData[key]["en"];
        }
        return "uknwn";
    }

    public static Translate(lang: string): void {
        let elements = document.querySelectorAll("[i18n-key]");
        elements.forEach(element => {
            if (element instanceof HTMLElement) {
                let key = element.getAttribute("i18n-key");
                if (key) {
                    element.innerText = I18Nizer.GetText(key, lang);
                }
            }
        })
    }
}