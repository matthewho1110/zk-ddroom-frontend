// * convert string to title case with regex, and turn camelCase to seaprated Camel Case

export const formatString = (str: string) => {
    const splitStr = str.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
    const titleCase = splitStr.map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );
    return titleCase.join(" ");
};
