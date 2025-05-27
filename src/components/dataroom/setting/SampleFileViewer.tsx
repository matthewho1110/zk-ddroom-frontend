// @ts-nocheck
// ! use nocheck to get away build error. This is because the webviewer lib is not typed
// MyApp.js
import { WebViewerInstance, WebViewerOptions } from "@pdftron/webviewer";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Skeleton } from "@mui/material";

import useUserProfileQuery from "../../../hooks/useUserProfile";

function SampleFileViewer({ watermark }) {
    const file = {
        name: "Sample file",
        tempUri: "/watermark_sample.pdf",
    };
    const viewer = useRef(null);
    const { data } = useUserProfileQuery();
    const beenInitialised = useRef(false);

    const [webViewer, setWebViewer] = useState<WebViewerInstance>();
    const [preview, setPreview] = useState<string>(null);

    const getWatermarkConfig = (watermarkConfig) => {
        let watermark = {};
        if (watermarkConfig) {
            let text = "";
            if (watermarkConfig.text) {
                if (watermarkConfig.text == "Custom text") {
                    text = watermarkConfig.customText;
                } else {
                    text = watermarkConfig.text;
                }
            }
            if (watermarkConfig.contentOptions) {
                if (watermarkConfig.contentOptions.indexOf("Email") >= 0) {
                    text = text + "\n" + data?.email;
                }
                if (watermarkConfig.contentOptions.indexOf("User Name") >= 0) {
                    text = text + "\n" + data?.firstname + " " + data?.lastname;
                }
                if (
                    watermarkConfig.contentOptions.indexOf(
                        "Organization Name"
                    ) >= 0
                ) {
                    text = text + "\n" + data?.organization;
                }
                if (
                    watermarkConfig.contentOptions.indexOf(
                        "Download Timestamp"
                    ) >= 0
                ) {
                    text = text + "\n" + new Date().toString();
                }
                if (
                    watermarkConfig.contentOptions.indexOf("Document Title") >=
                    0
                ) {
                    text = text + "\n" + file.name;
                }
            }
            if (watermarkConfig.textPosition) {
                if (
                    watermarkConfig.textPosition.indexOf("Header and Footer") >=
                    0
                ) {
                    watermark.header = {
                        fontSize: 15,
                        fontFamily: "sans-serif",
                        color: "black",
                        opacity: 25,
                        left: text,
                    };
                    watermark.footer = {
                        fontSize: 15,
                        fontFamily: "sans-serif",
                        color: "black",
                        opacity: 25,
                        right: text,
                    };
                }
                if (watermarkConfig.textPosition.indexOf("Diagonal") >= 0) {
                    watermark.diagonal = {
                        fontSize: 15, // or even smaller size
                        fontFamily: "sans-serif",
                        color: "black",
                        opacity: 25, // from 0 to 100
                        text: text,
                    };
                }
            }
        }
        return watermark;
    };

    const updateWatermark = () => {
        const { Core } = webViewer;
        Core.documentViewer.setWatermark(getWatermarkConfig(watermark));
        Core.documentViewer.enableGrayscaleMode();
        Core.documentViewer.disableGrayscaleMode();
    };

    useEffect(() => {
        if (watermark && webViewer) {
            updateWatermark();
        }
    }, [watermark, webViewer]);

    useLayoutEffect(() => {
        if (viewer.current) {
            if (beenInitialised.current) return;
            beenInitialised.current = true;
            import("@pdftron/webviewer").then(() => {
                WebViewer(
                    {
                        path: "/lib",
                        initialDoc: file.tempUri,
                        css: "/apryse_overridden.css",
                        isReadOnly: true,
                    } as WebViewerOptions,
                    viewer.current
                ).then(async (instance: WebViewerInstance) => {
                    const { Core } = instance;

                    // Set watermark
                    Core.documentViewer.setWatermark(
                        getWatermarkConfig(watermark)
                    );

                    Core.documentViewer.addEventListener(
                        "pageComplete",
                        (page, thumbnail) => {
                            setPreview(thumbnail);
                        }
                    );
                    setWebViewer(instance);
                });
            });
        }
    }, []);

    return (
        <>
            {/* * DEBUG use */}
            {/* <label>
                {<Typography>{PermissionTypeEnum[permission]}</Typography>}
            </label> */}
            <Box
                width="100%"
                position="relative"
                height="100%"
                style={{ aspectRatio: "12/16" }}
                overflow="hidden"
            >
                <div
                    className="webviewer"
                    ref={viewer}
                    style={{
                        position: "absolute",
                        opacity: 0,
                        width: "100%",
                        height: "100%",
                    }}
                ></div>

                {!preview && (
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100%"
                    ></Skeleton>
                )}

                {
                    <img
                        src={preview?.toDataURL()}
                        width="100%"
                        height="100%"
                        style={{ border: "1px solid lightgrey" }}
                    ></img>
                }
            </Box>
        </>
    );
}

export default SampleFileViewer;
