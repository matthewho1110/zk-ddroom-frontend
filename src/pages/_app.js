// internal modules
import { ThemeProvider } from "@mui/material/styles";

// Custom contexts
import { AlertProvider } from "../contexts/AlertContext";
import { UserProvider } from "../contexts/UserContext";
import { DataroomProvider } from "../contexts/DataroomContext";
import { ConfirmationDialogProvider } from "../contexts/ConfirmationDialogContext";

// MUI contexts
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { registerLicense } from "@syncfusion/ej2-base";

// React hooks
import { useState, useEffect } from "react";

// Custom styles
import "../styles/globals.css";
import theme from "../styles/theme";

// Custom components
import ComponentWrapper from "../components/ComponentWrapper";
import ConfirmationDialog from "../components/reusableComponents/ConfirmationDialog";
import { AlertPopup } from "../components/reusableComponents";
import { WelcomeContent } from "../components/reusableComponents/dataroom";

// MUI components
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { LicenseInfo } from "@mui/x-license-pro";

// Internal modules
import Head from "next/head";

// External modules
import {
    Hydrate,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

LicenseInfo.setLicenseKey(
    "3aed98047380ceb8773b8e5978dd5493T1JERVI6Mzg4NDEsRVhQSVJZPTE3MTUyODk3ODMwMDAsS0VZVkVSU0lPTj0x"
);
registerLicense(
    "Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWH9cdHRVRmZdUEV+V0Y="
);

function MyApp({ Component, pageProps }) {
    const [queryClient] = useState(() => new QueryClient());
    const [loading, setLoading] = useState(true);
    const [languageChange, setLanguageChange] = useState(false);
    const [title, setTitle] = useState("");
    return (
        <QueryClientProvider client={queryClient}>
            <Hydrate state={pageProps.dehydratedState}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <ThemeProvider theme={theme}>
                        <AlertProvider>
                            <UserProvider>
                                <ConfirmationDialogProvider>
                                    <Head>
                                        <meta
                                            name="viewport"
                                            content="width=device-width, initial-scale=1, user-scalable=no viewport-fit=cover"
                                        />
                                        {/* <script
                                            src="https://cdn.jsdelivr.net/npm/masonry-layout@4.2.2/dist/masonry.pkgd.min.js"
                                            integrity="sha384-GNFwBvfVxBkLMJpYMOABq3c+d3KnQxudP/mGPkzpZSTYykLBNsZEnG2D9G/X/+7D"
                                            crossOrigin="anonymous"
                                            async
                                        ></script> */}
                                    </Head>
                                    <AlertPopup />
                                    <ConfirmationDialog />
                                    <WelcomeContent />

                                    <ComponentWrapper
                                        languageChange
                                        title={title}
                                        onReload={() =>
                                            setLanguageChange(!languageChange)
                                        }
                                        onSetTitle={(str) => setTitle(str)}
                                    >
                                        <Component
                                            {...pageProps}
                                            title={title}
                                            onSetTitle={(str) => setTitle(str)}
                                        />
                                    </ComponentWrapper>
                                </ConfirmationDialogProvider>
                            </UserProvider>
                        </AlertProvider>
                    </ThemeProvider>
                </LocalizationProvider>
            </Hydrate>
        </QueryClientProvider>
    );
}

export default MyApp;
