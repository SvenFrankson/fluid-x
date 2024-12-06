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