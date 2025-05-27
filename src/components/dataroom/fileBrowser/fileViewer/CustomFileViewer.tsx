// @ts-nocheck
// ! use nocheck to get away build error. This is because the webviewer lib is not typed
// MyApp.js
import { WebViewerInstance, WebViewerOptions } from "@pdftron/webviewer";
import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useUser from "../../../../hooks/useUser";
import useDataroom from "../../../../hooks/useDataroom";
import { Box } from "@mui/material";
import { getPureFilename } from "../../../../utils/fileHelper";
import {
    PermissionTypeEnum,
    permissionConfigMap,
} from "./permission-config-map";
import useAlert from "../../../../hooks/useAlert";
import { binaryToFile, downloadBufferAsPdf, downloadFile } from "../utils";
import useUserProfileQuery from "../../../../hooks/useUserProfile";
import axios from "axios";

import { useRouter } from "next/router";
import useSWR from "swr";
import { isMobile } from "react-device-detect";

// custom hooks
import useConfirmationDialog from "../../../../hooks/useConfirmationDialog";

const AutoViewer = dynamic(() => import("@pdftron/webviewer-audio"), {
    ssr: false,
});

const FileViewer = dynamic(() => import("react-file-viewer"), {
    ssr: false,
});

const SUPPORTED_VIDEO_FORMATS = ["mp4", "webm"];
const SUPPORTED_AUDIO_FORMATS = ["mp3"];

function CustomFileViewer({ permission, file, dataroomId }) {
    // hooks
    const { setAlert } = useAlert();
    const viewer = useRef(null);
    const { axiosInstance } = useUser();
    const { data: user } = useUserProfileQuery();
    const beenInitialised = useRef(false);

    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const { data: dataroomData } = useSWR(
        dataroomId ? `/datarooms/${dataroomId}` : null,
        fetcher
    );

    const dataroom = dataroomData?.dataroom;

    const router = useRouter();

    const encryptionPassword =
        user?._id + "-" + Math.random().toString(36).slice(-8);
    const fileType = file.name?.split(".").pop();
    const isVideo = SUPPORTED_VIDEO_FORMATS.includes(fileType);
    const isAudio = SUPPORTED_AUDIO_FORMATS.includes(fileType);

    const [webViewer, setWebViewer] = useState<WebViewerInstance>();

    const POLL_INTERVAL = 60 * 1000; // 1 minute
    const getWatermarkConfig = () => {
        let watermark = {};

        if (dataroom?.watermark) {
            let text = "";
            if (dataroom?.watermark?.text == "Custom text") {
                text = dataroom?.watermark?.customText;
            } else {
                text = dataroom?.watermark?.text;
            }
            if (dataroom?.watermark?.contentOptions) {
                if (
                    dataroom?.watermark?.contentOptions.indexOf("User Name") >=
                    0
                ) {
                    text = text + "\n" + user?.firstname + " " + user?.lastname;
                }
                if (
                    dataroom?.watermark?.contentOptions.indexOf(
                        "Organization Name"
                    ) >= 0
                ) {
                    text = text + "\n" + user?.organization;
                }
                if (dataroom?.watermark?.contentOptions.indexOf("Email") >= 0) {
                    text = text + "\n" + user?.email;
                }
                if (
                    dataroom?.watermark?.contentOptions.indexOf(
                        "Download Timestamp"
                    ) >= 0
                ) {
                    text = text + "\n" + new Date().toString();
                }
                if (
                    dataroom?.watermark?.contentOptions.indexOf(
                        "Document Title"
                    ) >= 0
                ) {
                    text = text + "\n" + file.name;
                }
            }
            if (dataroom?.watermark?.textPosition) {
                if (
                    dataroom.watermark.textPosition.indexOf(
                        "Header and Footer"
                    ) >= 0
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
                if (dataroom.watermark.textPosition.indexOf("Diagonal") >= 0) {
                    watermark.diagonal = {
                        fontSize: 15, // or even smaller size
                        fontFamily: "sans-serif",
                        color: "black",
                        opacity: 25, // from 0 to 100
                        text: text,
                    };
                }
            }
            if (isVideo || isAudio) {
                watermark.shouldDrawOverAnnotations = true;
            }
        }

        return watermark;
    };

    const logDownloadActivity = async () => {
        try {
            await axiosInstance.post(
                `datarooms/${dataroomId}/files/${file._id}/download`,
                {}
            );
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    const updateActivityHistory = async () => {
        try {
            await axiosInstance.patch(
                `datarooms/${dataroomId}/files/${file._id}/viewActivity`,
                {}
            );
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    const encryptAndDownloadPdf = async (_instance) => {
        const { Core } = _instance;
        let currentDoc = Core.documentViewer.getDocument();

        let buf = await currentDoc.getFileData();

        if (fileType != "pdf") {
            buf = await Core.officeToPDFBuffer(buf);
        }
        let doc = await Core.PDFNet.PDFDoc.createFromBuffer(buf);

        const newHandler = await Core.PDFNet.SecurityHandler.createDefault();

        // Set a new password required to open a document
        newHandler.changeUserPasswordUString(encryptionPassword);

        // Set Permissions
        newHandler.setPermission(
            Core.PDFNet.SecurityHandler.Permission.e_print,
            false
        );
        newHandler.setPermission(
            Core.PDFNet.SecurityHandler.Permission.e_extract_content,
            true
        );

        // Note: document takes the ownership of newHandler.
        doc.setSecurityHandler(newHandler);

        // Save the changes

        buf = await doc.saveMemoryBuffer(
            Core.PDFNet.SDFDoc.SaveOptions.e_linearized
        );
        const newFilename = getPureFilename(file.name) + "_confidential.pdf";
        downloadBufferAsPdf(buf, newFilename);
        logDownloadActivity();
    };

    const downloadProtected = async (_instance) => {
        const { PDFNet } = _instance.Core;
        await PDFNet.initialize();

        const doc = await PDFNet.PDFDoc.createFromURL("/protected_file.pdf");

        const page = await doc.getPage(1);

        // Content Replacer
        const replacer = await PDFNet.ContentReplacer.create();

        // const createURIAction = await PDFNet.Action.createURI(
        //     doc,
        //     `${process.env.FRONTEND_URI}/dataroom/${dataroomId}/files?filePath=${file._id}`
        // );
        // const linkRect = new PDFNet.Rect(70, 515, 185, 472);
        // const hyperlink = await PDFNet.LinkAnnot.create(doc, linkRect);
        // await hyperlink.setAction(createURIAction);

        // await hyperlink.setBorderStyle(
        //     await PDFNet.AnnotBorderStyle.create(0, 0)
        // );

        // await hyperlink.refreshAppearance();

        // await page.annotPushBack(hyperlink);

        await replacer.addString(
            "link",
            `${process.env.FRONTEND_URI}/dataroom/${dataroomId}/files?filePath=${file._id}`
        );

        await replacer.process(page);

        let buf = await doc.saveMemoryBuffer(
            PDFNet.SDFDoc.SaveOptions.e_remove_unused
        );

        const newFilename = file.name + "_protected.pdf";
        downloadBufferAsPdf(buf, newFilename);
    };

    const saveAsPdf = async (_instance) => {
        try {
            const { Core } = _instance;
            let currentDoc = Core.documentViewer.getDocument();

            let buf = await currentDoc.getFileData();

            if (fileType != "pdf") {
                buf = await Core.officeToPDFBuffer(buf);
            }

            const updatedFile = binaryToFile(
                buf,
                getPureFilename(file.name) + ".pdf",
                "application/pdf"
            );

            let putUrl;

            putUrl = (
                await axiosInstance.patch(
                    `/datarooms/${file.dataroom}/files/${file._id}/edit`,
                    {
                        newFileName: updatedFile.name,
                        newFileType: "application/pdf",
                        newFileSize: updatedFile.size,
                    }
                )
            ).data.signedPutUrl;

            await axios.put(putUrl, updatedFile, {
                headers: {
                    "Content-Type": "application/pdf",
                },
            });

            router.push(
                `/dataroom/${file.dataroom}/files?filePath=${file._id}`
            );

            setAlert("Redaction has been saved.", "success");
        } catch (err) {
            console.log(err);
            setAlert("An error occurred while saving redaction.", "error");
        }
    };

    useLayoutEffect(() => {
        if (
            !file?.tempUri ||
            !viewer.current ||
            !dataroomData?.dataroom ||
            !permission ||
            !user ||
            beenInitialised.current 
        )
        
            return;
        beenInitialised.current = true;
        
        import("@pdftron/webviewer").then(() => {
            let options = {
                fullAPI: true,
                path: "/lib",
            };

            if (!(isAudio || isVideo)) {
                options = {
                    ...options,
                    initialDoc: file.tempUri,
                    filename: file.name,
                    css: "/apryse_overridden.css",
                    // @ts-ignore
                    ...permissionConfigMap[permission],
                };
            } else {
                options.selectAnnotationOnCreation = true;
            }
            console.log ("init", beenInitialised.current);
            WebViewer(options as WebViewerOptions, viewer.current).then(
                async (instance: WebViewerInstance) => {
                    const { Core, UI, contextMenuPopup } = instance;


                    // Ensure document is loaded before setting the layout
                    Core.documentViewer.addEventListener('documentLoaded', () => {
                        UI.setLayoutMode(UI.LayoutMode.Continuous);
                    });


                    // Move full screen button out of the view control
                    UI.setHeaderItems(header => {
                        header.push({
                            type: 'actionButton',
                            dataElement: 'fullScreenButton',
                            title: 'Full Screen',
                            img: '/images/fullscreen.svg',
                            onClick: () => {
                                instance.UI.toggleFullScreen();
                            },
                        });
                    });




                    let downloadOptions = [];
                    // Add custom download button
                    // if (permission >= PermissionTypeEnum.download_encrypted) {
                    //     downloadOptions.push({
                    //         type: "actionButton",
                    //         dataElement: "downloadEncrypted",
                    //         label: "Download Encrypted",
                    //         className: "row",
                    //         img: "/images/permissions/download_encrypted.svg",
                    //         onClick: () => {
                    //             setConfirmationDialog({
                    //                 title: "The file has been encrypted with the below password. Please do not share it with anyone and keep it safe.",
                    //                 description: encryptionPassword,
                    //                 onConfirm: () => {
                    //                     encryptAndDownloadPdf(instance);
                    //                 },
                    //                 onCancel: () => {},
                    //             });
                    //         },
                    //     });
                    // }

                    if (permission >= PermissionTypeEnum.download_encrypted) {
                        downloadOptions.push({
                            type: "actionButton",
                            dataElement: "downloadEncrypted",
                            label: "Download Protected",
                            className: "row",
                            img: "/images/permissions/download_encrypted.svg",
                            onClick: () => {
                                downloadProtected(instance);
                            },
                        });
                    }

                    if (
                        permission >= PermissionTypeEnum.download_pdf &&
                        !(isVideo || isAudio)
                    ) {
                        downloadOptions.push({
                            type: "actionButton",
                            dataElement: "downloadPdf",
                            label: "Download PDF",
                            className: "row",
                            img: "/images/permissions/download_pdf.svg",
                            onClick: () => {
                                UI.downloadPdf({
                                    filename: getPureFilename(file.name),
                                });
                                logDownloadActivity();
                            },
                        });
                    }
                    if (permission >= PermissionTypeEnum.download_raw) {
                        downloadOptions.push({
                            type: "actionButton",
                            dataElement: "downloadOriginal",
                            label: "Download Original",
                            className: "row",
                            img: "/images/permissions/download_original.svg",

                            onClick: () => {
                                downloadFile(file.tempUri, file.name);
                                logDownloadActivity();
                            },
                        });
                    }

                    // Update main menu (the menu button on the top left)
                    UI.settingsMenuOverlay.update(downloadOptions);

                    // Update right click menu
                    contextMenuPopup.update([
                        ...contextMenuPopup
                            .getItems()
                            .filter((item) =>
                                ["panToolButton"].includes(item.dataElement)
                            ),
                    ]);

                    // Update UI
                    UI.disableFeatures(Object.values(UI.Feature));

                    if (!isVideo || !isAudio) {
                        UI.enableFeatures([
                            UI.Feature.Search,
                            UI.Feature.MouseWheelZoom,
                            UI.Feature.TextSelection,
                            UI.Feature.Ribbons,
                            UI.Feature.Copy,
                        ]);
                    }

                    UI.disableElements([
                        "toolbarGroup-Insert",
                        "toolbarGroup-Annotate",
                        "toolbarGroup-Shapes",
                        "toolbarGroup-Measure",
                        "toolbarGroup-Edit",
                        "toolbarGroup-Forms",
                        "toolbarGroup-FillAndSign",
                        "textUnderlineToolButton",
                        "textSquigglyToolButton",
                        "textHighlightToolButton",
                        "textStrikeoutToolButton",
                        "textRedactToolButton",
                        "linkButton",
                    ]);

                    if (
                        permission >= PermissionTypeEnum.edit &&
                        !(isVideo || isAudio)
                    ) {
                        UI.enableFeatures([
                            UI.Feature.Redaction,
                            UI.Feature.WatermarkPanel,
                            UI.Feature.Annotations,
                        ]);
                    }

                    // Handle video and audio formats
                    if (isVideo) {
                        const { initializeVideoViewer } = await import(
                            "@pdftron/webviewer-video"
                        );
                        const { loadVideo } = await initializeVideoViewer(
                            instance,
                            {
                                showSubtitlesButton: false,
                                showFullscreenButton: false,
                                license:
                                    "---- Insert commercial license key here after purchase ----",
                            }
                        );
                        const videoUrl = file.tempUri;
                        loadVideo(videoUrl);
                    } else if (isAudio) {
                        const { initializeAudioViewer } = await import(
                            "@pdftron/webviewer-audio"
                        );
                        const { loadAudio } = await initializeAudioViewer(
                            instance,
                            {
                                license:
                                    "---- Insert commercial license key here after purchase ----",
                            }
                        );
                        const audioUrl = file.tempUri;
                        loadAudio(audioUrl);
                    }

                    // Set watermark
                    Core.documentViewer.setWatermark(getWatermarkConfig());

                    setWebViewer(instance);
                }
            );
            // }
        });

        updateActivityHistory();
        const interval = setInterval(() => {
            updateActivityHistory();
        }, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [file, permission, dataroomData, user]);

    const onError = (e) => {
        console.log(e);
    };

    useEffect(() => {
        if (!webViewer) return;
        // TODO integrate upsert new url
        webViewer.Core.annotationManager.addEventListener(
            "annotationChanged",
            async (annotation, action, options) => {
                if (
                    action === "delete" &&
                    options?.source == "redactionApplied"
                ) {
                    saveAsPdf(webViewer);
                }
            }
        );
    }, [webViewer, axiosInstance]);

    return (
        <>
            {/* * DEBUG use */}
            {/* <label>
                {<Typography>{PermissionTypeEnum[permission]}</Typography>}
            </label> */}
            <Box
                width="100%"
                position="relative"
                height={isMobile ? "70vh" : "100vh"}
                overflow="hidden"
            >
                <div
                    className="webviewer"
                    ref={viewer}
                    style={{ height: "100%", width: "100%" }}
                ></div>
            </Box>
        </>
    );
}

export default CustomFileViewer;
