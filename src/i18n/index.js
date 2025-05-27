import i18n from "./i18n";

const lange = (str, ...args) => {
    let locale = "en";
    let transformTxt = "";

    if (typeof window !== "undefined") {
        locale =
            window && localStorage && localStorage.getItem("local")
                ? localStorage.getItem("local")
                : "en";
    }

    transformTxt = i18n[locale][str] || str;
    if (args?.length) {
        args.forEach(item => transformTxt += (locale === "en" ? " " : "") + (i18n[locale][item]) || item)
    }
    return transformTxt
};

export default lange;
