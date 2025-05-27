import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { createContext, useMemo, useState } from "react";

// mui theme settings
const themeSettings = () => {
    // not using this now
    //const colors = tokens(mode);
    return {
        palette: {
            // palette values for dark mode
            primary: {
                main: "#834ca7",
                dark: "#290F30",
                light: "#8ec7fe",
                contrastText: "#fff",
            },
            secondary: {
                main: "#FF8C00",
                light: "#ffbb33",
                dark: "#c65d00",
                contrastText: "#fff",
            },
            neutral: {
                main: "#ababab",
                light: "#f2f2f2",
                dark: "#808080",
                contrastText: "#fff",
            },
        },
        typography: {
            fontFamily: "Roboto, Helvetica, Arial, sans-serif",
            fontSize: 10,
            h1: {
                fontSize: 24,
            },
            h2: {
                fontSize: 22,
            },
            h3: {
                fontSize: 20,
            },
            h4: {
                fontSize: 18,
            },
            h5: {
                fontSize: 16,
            },
            h6: {
                fontSize: 14,
            },
            body1: {
                fontSize: 12,
            },
            body2: {
                fontSize: 10,
            },
        },
        components: {
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        fontSize: "0.63rem",
                    },
                },
            },
            MuiInputBase: {
                styleOverrides: {
                    input: {
                        fontSize: "0.68rem",
                    },
                },
            },
            MuiTextField: {
                defaultProps: {
                    size: "small",
                },
            },
        },
    };
};

let theme = createTheme(themeSettings());
theme = responsiveFontSizes(theme);

export default theme;

// context for color mode
// export const ColorModeContext = createContext({
//     toggleColorMode: () => {},
// });

// export const useMode = () => {
//     // This is not being used for now
//     const [mode, setMode] = useState("light");

//     const colorMode = useMemo(
//         () => ({
//             toggleColorMode: () =>
//                 setMode((prev) => (prev === "light" ? "dark" : "light")),
//         }),
//         []
//     );

//     const theme = useMemo(
//         () => responsiveFontSizes(createTheme(themeSettings(mode))),
//         [mode]
//     );
//     return [theme, colorMode];
// };
