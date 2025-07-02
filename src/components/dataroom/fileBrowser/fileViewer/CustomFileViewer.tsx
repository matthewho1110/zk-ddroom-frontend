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
import DocXViewer from "./DocXViewer";
import SpreadsheetViewer from "./SpreadsheetViewer";
// import {
//     ConvertApi,
//     ConvertSettings,
//     ConvertDocumentRequest,
//     InfoApi,
//     GetSupportedConversionTypesRequest,
// } from "groupdocs-conversion-cloud";

// custom hooks
import useConfirmationDialog from "../../../../hooks/useConfirmationDialog";
import { setIn } from "formik";

const AutoViewer = dynamic(() => import("@pdftron/webviewer-audio"), {
    ssr: false,
});

const FileViewer = dynamic(() => import("react-file-viewer"), {
    ssr: false,
});

const SUPPORTED_VIDEO_FORMATS = ["mp4", "webm"];
const SUPPORTED_AUDIO_FORMATS = ["mp3"];
const SUPPORTED_SPREADSHEET_FORMATS = ["xlsx", "xls", "csv"];

let audioInstance;

function CustomFileViewer({
    permission,
    fileOrFiles,
    dataroomId,
    isCompare,
    compareMode,
}) {
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
    const file = fileOrFiles.length > 0 ? fileOrFiles[0] : fileOrFiles;
    const dataroom = dataroomData?.dataroom;

    const router = useRouter();

    const encryptionPassword =
        user?._id + "-" + Math.random().toString(36).slice(-8);
    const fileType = file.name?.split(".").pop();
    const isVideo = SUPPORTED_VIDEO_FORMATS.includes(fileType);
    const isAudio = SUPPORTED_AUDIO_FORMATS.includes(fileType);
    const isDocX = fileType === "docx" || fileType === "rtf";
    const isPhotoshop = fileType === "psd";
    const isSpreadsheet = SUPPORTED_SPREADSHEET_FORMATS.includes(fileType);

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

    const convertAiPsdToJpeg = async (file) => {
        // const appSid: string = "aa19e10e-6ac9-4a80-aa8a-493adf2e125a";
        // const appKey: string = "43abf540b5451c63d28471d6bea21525";
        // const api: ConvertApi = ConvertApi.fromKeys(appSid, appKey);
        // const settings: ConvertSettings = new ConvertSettings();
        // settings.filePath = file;
        // settings.format = "jpeg";
        // settings.outputPath = "output";
        // settings.convertOptions = {
        //     jpegOptions: {
        //         quality: 100,
        //     },
        // };
        // const result = await api.convertDocument(
        //     new ConvertDocumentRequest(settings),
        //     { mode: "no-cors" }
        // );
        // console.log(result);
    };

    // Helper function to convert JPEG to Baseline using a Canvas
    const convertToBaselineJPEG = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function () {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    // Re-encode the image as baseline JPEG
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(
                                    new Error(
                                        "Failed to convert image to baseline JPEG"
                                    )
                                );
                            }
                        },
                        "image/jpeg", // Specify output format
                        0.8 // Quality, adjust as needed
                    );
                };
                img.onerror = function () {
                    reject(new Error("Failed to load image for conversion"));
                };
            };
            reader.onerror = function () {
                reject(new Error("Failed to read file for conversion"));
            };
            reader.readAsDataURL(file);
        });
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

        const initializeWebViewer = async () => {
            let fileUri = file.tempUri;
            if (fileType === "jpg" || fileType === "jpeg") {
                const response = await fetch(fileUri);
                const blob = await response.blob();
                const baselineBlob = await convertToBaselineJPEG(blob);
                fileUri = URL.createObjectURL(baselineBlob); // Create a new URI for the baseline JPEG
            }
            // if (isPhotoshop) {
            //     const response = await fetch(fileUri);
            //     const blob = await response.blob();
            //     const jpegBlob = convertAiPsdToJpeg(fileUri);
            //     // console.log(jpegBlob);
            //     // fileUri = URL.createObjectURL(baselineBlob);
            // }
            import("@pdftron/webviewer").then(() => {
                let options = {
                    fullAPI: true,
                    path: "/lib",
                };

                if (!(isAudio || isVideo)) {
                    options = {
                        ...options,
                        initialDoc: fileUri,
                        filename: file.name,
                        css: "/apryse_overridden.css",
                        // @ts-ignore
                        ...permissionConfigMap[permission],
                    };
                } else {
                    options.selectAnnotationOnCreation = true;
                }

                if (file.type === "application/pdf") {
                    options.extension = "pdf";
                }
                WebViewer(options as WebViewerOptions, viewer.current).then(
                    async (instance: WebViewerInstance) => {
                        const { Core, UI, contextMenuPopup } = instance;
                        if (isCompare && compareMode === "text") {
                            const { Annotations } = Core;
                            const { Color } = Annotations;
                            UI.addEventListener(
                                UI.Events.MULTI_VIEWER_READY,
                                () => {
                                    const [documentViewer1, documentViewer2] =
                                        Core.getDocumentViewers();
                                    const startCompare = async () => {
                                        const iframe =
                                            document.querySelector(
                                                "[id^='webviewer-']"
                                            );
                                        if (iframe) {
                                            // getElement by aria label
                                            const menuButton =
                                                iframe.contentWindow.document.querySelector(
                                                    "[aria-label='Menu']"
                                                );
                                            menuButton.style.display = "none";
                                            const divider =
                                                iframe.contentWindow.document.querySelector(
                                                    ".divider"
                                                );
                                            divider.style.display = "none";
                                            const controlBtn =
                                                iframe.contentWindow.document.querySelector(
                                                    "[aria-label='View Controls']"
                                                );
                                            controlBtn.style.display = "none";
                                            const ribbons =
                                                iframe.contentWindow.document.querySelector(
                                                    ".ribbons-container"
                                                );
                                            ribbons.style.display = "none";
                                        }
                                        if (
                                            documentViewer1.getDocument() &&
                                            iframe
                                        ) {
                                            const header1 =
                                                iframe.contentWindow.document.getElementById(
                                                    "header1"
                                                );
                                            header1.style.justifyContent =
                                                "center";
                                            header1.querySelector(
                                                ".control-buttons"
                                            ).style.display = "none";
                                            header1.querySelector(
                                                ".zoom-overlay"
                                            ).style.display = "none";
                                            const filename1 =
                                                header1.querySelector(
                                                    "div.file-name"
                                                );

                                            if (filename1) {
                                                filename1.textContent =
                                                    fileOrFiles[0].name;
                                            }
                                            const header2 =
                                                iframe.contentWindow.document.getElementById(
                                                    "header2"
                                                );
                                            header2.style.justifyContent =
                                                "center";
                                            header2.querySelector(
                                                ".control-buttons"
                                            ).style.display = "none";
                                            header2.querySelector(
                                                ".zoom-overlay"
                                            ).style.display = "none";
                                            const filename2 =
                                                header2.querySelector(
                                                    "div.file-name"
                                                );
                                            if (filename2) {
                                                filename2.textContent =
                                                    fileOrFiles[1].name;
                                            }

                                            const dropArea =
                                                iframe.contentWindow.document.querySelector(
                                                    "div.DropArea"
                                                );
                                            if (dropArea) {
                                                dropArea.style.display = "none";
                                            }
                                        }
                                        if (
                                            documentViewer2.getDocument() &&
                                            iframe
                                        ) {
                                            const header1 =
                                                iframe.contentWindow.document.getElementById(
                                                    "header1"
                                                );
                                            header1.querySelector(
                                                ".control-buttons"
                                            ).style.display = "none";
                                            header1.querySelector(
                                                ".zoom-overlay"
                                            ).style.display = "none";

                                            const filename1 =
                                                header1.querySelector(
                                                    "div.file-name"
                                                );

                                            if (filename1) {
                                                filename1.textContent =
                                                    fileOrFiles[0].name;
                                            }
                                            const header2 =
                                                iframe.contentWindow.document.getElementById(
                                                    "header2"
                                                );
                                            header2.querySelector(
                                                ".control-buttons"
                                            ).style.display = "none";
                                            header2.querySelector(
                                                ".zoom-overlay"
                                            ).style.display = "none";
                                            const filename2 =
                                                header2.querySelector(
                                                    "div.file-name"
                                                );
                                            if (filename2) {
                                                filename2.textContent =
                                                    fileOrFiles[1].name;
                                            }

                                            const dropArea =
                                                iframe.contentWindow.document.querySelector(
                                                    "div.DropArea"
                                                );
                                            if (dropArea) {
                                                dropArea.style.display = "none";
                                            }
                                        }
                                    };
                                    documentViewer1.addEventListener(
                                        "documentLoaded",
                                        startCompare
                                    );
                                    documentViewer2.addEventListener(
                                        "documentLoaded",
                                        startCompare
                                    );
                                    documentViewer1.loadDocument(
                                        fileOrFiles[0].tempUri
                                    );
                                    documentViewer2.loadDocument(
                                        fileOrFiles[1].tempUri
                                    );
                                }
                            );

                            // UI.disableElements(["header"]);
                            UI.disableFeatures([UI.Feature.Redaction]);
                            UI.enableFeatures([UI.Feature.MultiViewerMode]);
                            UI.openElements(["progressModal"]);
                        } else if (isCompare && compareMode === "scan") {
                            const { PDFNet } = instance.Core;
                            instance.UI.disableElements(["header"]);
                            instance.UI.addEventListener(
                                "viewerLoaded",
                                async () => {
                                    // initialize PDFNet
                                    await PDFNet.initialize();

                                    const getDocument = async (url) => {
                                        const newDoc =
                                            await instance.Core.createDocument(
                                                url
                                            );
                                        return await newDoc.getPDFDoc();
                                    };

                                    const [doc1, doc2] = await Promise.all([
                                        getDocument(fileOrFiles[0].tempUri),
                                        getDocument(fileOrFiles[1].tempUri),
                                    ]);

                                    // inside `viewerLoaded`
                                    const getPageArray = async (doc) => {
                                        const arr = [];
                                        const itr = await doc.getPageIterator(
                                            1
                                        );

                                        for (
                                            itr;
                                            await itr.hasNext();
                                            itr.next()
                                        ) {
                                            const page = await itr.current();
                                            arr.push(page);
                                        }

                                        return arr;
                                    };

                                    const [doc1Pages, doc2Pages] =
                                        await Promise.all([
                                            getPageArray(doc1),
                                            getPageArray(doc2),
                                        ]);

                                    console.log(doc1Pages, doc2Pages);

                                    const newDoc = await PDFNet.PDFDoc.create();
                                    newDoc.lock();

                                    // we'll loop over the doc with the most pages
                                    const biggestLength = Math.max(
                                        doc1Pages.length,
                                        doc2Pages.length
                                    );

                                    for (let i = 0; i < biggestLength; i++) {
                                        let page1 = doc1Pages[i];
                                        let page2 = doc2Pages[i];

                                        // handle the case where one document has more pages than the other
                                        if (!page1) {
                                            page1 = await doc1.pageCreate(); // create a blank page
                                        }
                                        if (!page2) {
                                            page2 = await doc2.pageCreate(); // create a blank page
                                        }
                                        await newDoc.appendVisualDiff(
                                            page1,
                                            page2
                                        );
                                    }

                                    newDoc.unlock();

                                    // display the document!
                                    // instance is a global variable thats automatically defined inside the config file.

                                    instance.UI.loadDocument(newDoc);
                                }
                            );
                        } else {
                            // Ensure document is loaded before setting the layout
                            Core.documentViewer.addEventListener(
                                "documentLoaded",
                                () => {
                                    UI.setLayoutMode(UI.LayoutMode.Continuous);
                                }
                            );

                            // Move full screen button out of the view control
                            UI.setHeaderItems((header) => {
                                header.push({
                                    type: "actionButton",
                                    dataElement: "fullScreenButton",
                                    title: "Full Screen",
                                    img: "/images/fullscreen.svg",
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

                            if (
                                permission >=
                                PermissionTypeEnum.download_encrypted
                            ) {
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
                                            filename: getPureFilename(
                                                file.name
                                            ),
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
                                        ["panToolButton"].includes(
                                            item.dataElement
                                        )
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
                                    UI.Feature.Forms, // Enable form editing
                                    UI.Feature.ContentEdit, // Enable content editing
                                    UI.Feature.Edit, // Enable general editing
                                    UI.Feature.StampAnnotation, // Stamping tool
                                    UI.Feature.ShapeTools, // Shape annotation tools
                                    UI.Feature.TextTools, // Text annotation tools
                                    UI.Feature.MeasureTools, // Measurement tools
                                ]);
                            }

                            // Handle video and audio formats
                            if (isVideo) {
                                const { initializeVideoViewer } = await import(
                                    "@pdftron/webviewer-video"
                                );
                                const { loadVideo } =
                                    await initializeVideoViewer(instance, {
                                        showSubtitlesButton: false,
                                        showFullscreenButton: false,
                                        license:
                                            "---- Insert commercial license key here after purchase ----",
                                    });
                                const videoUrl = file.tempUri;
                                loadVideo(videoUrl);
                            } else if (isAudio) {
                                // const { initializeAudioViewer } = await import(
                                //     "@pdftron/webviewer-audio"
                                // );
                                // const { loadAudio } = await initializeAudioViewer(
                                //     instance,
                                //     {
                                //         license:
                                //             "---- Insert commercial license key here after purchase ----",
                                //     }
                                // );
                                // const audioUrl = file.tempUri;
                                // loadAudio(audioUrl);
                                // audioInstance = instance;
                                const { initializeAudioViewer } = await import(
                                    "@pdftron/webviewer-audio"
                                );
                                const webViewerAudioInstance =
                                    await initializeAudioViewer(instance, {
                                        license: "",
                                    });
                                await webViewerAudioInstance.loadAudio(fileUri);
                                audioInstance = webViewerAudioInstance;
                            }

                            // Set watermark
                            Core.documentViewer.setWatermark(
                                getWatermarkConfig()
                            );

                            setWebViewer(instance);
                        }
                    }
                );
                // }
            });
        };
        initializeWebViewer();
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
        return () => {
            if (audioInstance && webViewer) {
                const waveSurfer = audioInstance.getWaveSurfer(webViewer);
                if (waveSurfer) {
                    waveSurfer.pause(); // Pauses the audio playback
                    waveSurfer.seekTo(0); // Resets the playback to the start
                }
            }
            audioInstance = null;
        };
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
                {isDocX ? (
                    <DocXViewer
                        file={file}
                        user={user}
                        permission={permission}
                        style={{
                            display: isDocX ? "block" : "none",
                        }}
                    ></DocXViewer>
                ) : isSpreadsheet ? (
                    <SpreadsheetViewer
                        file={file}
                        permission={permission}
                        style={{
                            display: isDocX ? "block" : "none",
                        }}
                    />
                ) : (
                    <div
                        className="webviewer"
                        ref={viewer}
                        style={{
                            height: "100%",
                            width: "100%",
                            display: isDocX ? "none" : "block",
                        }}
                    ></div>
                )}
            </Box>
        </>
    );
}

export default CustomFileViewer;
