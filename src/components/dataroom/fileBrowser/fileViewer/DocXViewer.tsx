import React, { useEffect, useRef } from "react";
import {
    DocumentEditorContainerComponent,
    Toolbar,
    Inject,
} from "@syncfusion/ej2-react-documenteditor";
import router from "next/router";
import axios from "axios";
// @ts-ignore
import { v4 } from "uuid";
import { binaryToFile } from "../utils";
import { PermissionTypeEnum } from "./permission-config-map";
import useAlert from "@hooks/useAlert";
import useUser from "@hooks/useUser";
import useSWR from "swr";

function DocXViewer({
    file,
    user,
    permission,
}: {
    file: any;
    user: any;
    permission: any;
}) {
    const editorObj = useRef<DocumentEditorContainerComponent>(null); // Explicitly type the ref
    const { axiosInstance } = useUser();
    const { setAlert } = useAlert();
    const hasCustomToolbar = useRef(false);
    const fetcher = (url: any) =>
        axiosInstance.get(url).then((res: { data: any }) => res.data);
    const { data: dataroomData, mutate: mutateDataroomData } = useSWR(
        file.dataroom ? `/datarooms/${file.dataroom}` : null,
        fetcher
    );
    const { data: usedStorage } = useSWR(
        file.dataroom ? `/datarooms/${file.dataroom}/size` : null,
        fetcher
    );

    const dataroom = dataroomData?.dataroom;

    const loadFile = async (file: { tempUri: any }) => {
        try {
            if (file.tempUri && file.tempUri instanceof Blob) {
                const blobUrl = URL.createObjectURL(file.tempUri);
                file.tempUri = blobUrl;
            }
            if (editorObj.current && editorObj.current.documentEditor) {
                editorObj.current.documentEditor.open(file.tempUri);
                if (permission < PermissionTypeEnum.edit) {
                    editorObj.current.documentEditor.isReadOnly = true;
                }
            }
        } catch (error) {
            console.error("Failed to load the document:", error);
        }
    };

    const onDownload = () => {
        if (file.name && editorObj.current) {
            const lastDotIndex = file.name.lastIndexOf(".");
            const fileNameWithoutExt =
                lastDotIndex !== -1
                    ? file.name.slice(0, lastDotIndex)
                    : file.name;
            editorObj.current.documentEditor.save(fileNameWithoutExt, "Docx");
        }
    };

    const onSave = async () => {
        try {
            if (file.name && editorObj.current?.documentEditor) {
                const lastDotIndex = file.name.lastIndexOf(".");
                const fileExt =
                    lastDotIndex !== -1
                        ? file.name.slice(lastDotIndex + 1)
                        : "docx";

                const docBlob =
                    await editorObj.current.documentEditor.saveAsBlob("Docx");
                if (!docBlob) {
                    setAlert(
                        // @ts-ignore
                        "Failed to save the document. Document blob is undefined.",
                        "error"
                    );
                    return;
                }

                const updatedFile = binaryToFile(
                    // @ts-ignore
                    docBlob,
                    file.name,
                    fileExt === "rtf"
                        ? "application/rtf"
                        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                );

                const putUrl = (
                    await axiosInstance.patch(
                        `/datarooms/${file.dataroom}/files/${file._id}/edit`,
                        {
                            newFileName: file.name,
                            newFileType: updatedFile.type,
                            newFileSize: updatedFile.size,
                        }
                    )
                ).data.signedPutUrl;

                await axios.put(putUrl, updatedFile, {
                    headers: {
                        "Content-Type": updatedFile.type,
                    },
                });

                router.push(
                    `/dataroom/${file.dataroom}/files?filePath=${file._id}`
                );

                loadFile(file);
                // @ts-ignore
                setAlert("Document has been saved.", "success");
            } else {
                // @ts-ignore
                setAlert(
                    // @ts-ignore
                    "An error occurred while saving the document.",
                    "error"
                );
            }
        } catch (err) {
            console.log(err);
            // @ts-ignore
            setAlert("An error occurred while saving the document.", "error");
        }
    };

    const handleS3Upload = async (
        signedFile: { s3Url: string; fileId: any },
        tempFile: any
    ) => {
        try {
            await axios.put(signedFile.s3Url, tempFile, {
                headers: {
                    "Content-Type": tempFile.type,
                },
            });
            const form = new FormData();
            form.append("file", tempFile);
            await axiosInstance.post(
                `/datarooms/${file.dataroom}/files/${signedFile.fileId}/confirmUploadedWithGpt`,
                form,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
        } catch (err) {
            console.log(err);
        }
    };

    const onUpload = async () => {
        try {
            const tempId = v4();
            const tempFile = new File(
                [file.blob],
                file.name + "_" + Date.now().toString() + ".docx",
                {
                    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                }
            );
            console.log(file.blob);
            if (dataroom?.maxStorage != -1) {
                if (usedStorage?.size + file.blob.size > dataroom?.maxStorage) {
                    setAlert(
                        // @ts-ignore
                        "Upload size exceeds dataroom storage limit",
                        "warning"
                    );
                    return;
                }
            }
            (tempFile as any).path = file.name;
            const fileList = [
                {
                    data: tempFile,
                    name: tempFile.name,
                    size: tempFile.size,
                    type: tempFile.type,
                    tempId: tempId,
                },
            ];
            const _path = "/root";
            const responseGetPath = await axiosInstance.get(
                `datarooms/${file.dataroom}/files?path=${encodeURIComponent(
                    _path
                )}`
            );

            const response = await axiosInstance.patch(
                `datarooms/${file.dataroom}/files/${responseGetPath.data._id}/upload`,
                {
                    uploads: fileList,
                }
            );
            const signedFile = response.data;
            await handleS3Upload(signedFile[tempId], tempFile);
            setAlert(
                // @ts-ignore
                "File uploaded successfully",
                "success"
            );
            router.push(
                `/dataroom/${file.dataroom}/files?filePath=${signedFile[tempId].fileId}`
            );
        } catch (err) {
            console.log(err);
            setAlert(
                // @ts-ignore
                "An error occurred while uploading the document.",
                "error"
            );
        }
    };

    const customToolbar = () => {
        if (editorObj.current?.toolbarModule && !hasCustomToolbar.current) {
            const toolbar = editorObj.current.toolbarModule.toolbar;

            const downloadButton = {
                prefixIcon: "e-download",
                tooltipText: "Download",
                text: "Download",
                id: "Download",
                click: onDownload,
            };
            const saveButton = {
                prefixIcon: "e-save",
                tooltipText: "Save",
                text: "Save",
                id: "Save",
                click: onSave,
            };

            const uploadButton = {
                prefixIcon: "e-save",
                tooltipText: "Upload",
                text: "Upload",
                id: "Upload",
                click: onUpload,
            };

            const backButton = {
                prefixIcon: "e-undo",
                tooltipText: "Back",
                text: "Back",
                id: "Back",
                click: () => {
                    // reload the page
                    router.reload();
                },
            };
            if (permission >= PermissionTypeEnum.download_encrypted) {
                toolbar.addItems([downloadButton], 0);
            }
            if (permission >= PermissionTypeEnum.edit) {
                toolbar.addItems([saveButton], 0);
            }
            if (permission === -1) {
                toolbar.addItems([backButton, uploadButton], 0);
            }
            hasCustomToolbar.current = true;
        }
    };

    useEffect(() => {
        if (file) {
            loadFile(file);
        }
    }, [file]);

    useEffect(() => {
        if (editorObj.current?.toolbarModule) {
            customToolbar();
        }
    }, [editorObj.current]);

    return (
        <div className="App">
            <style>
                {`
                @import url("https://cdn.syncfusion.com/ej2/20.3.56/bootstrap5.css");
                `}
            </style>
            <DocumentEditorContainerComponent
                ref={editorObj}
                height="1000px"
                width="100%"
                enableToolbar={true}
                serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
                toolbarItems={
                    permission >= PermissionTypeEnum.edit
                        ? [
                              "Separator",
                              "Undo",
                              "Redo",
                              "Separator",
                              "Image",
                              "Table",
                              "Hyperlink",
                              "Bookmark",
                              "TableOfContents",
                              "Separator",
                              "Header",
                              "Footer",
                              "PageSetup",
                              "PageNumber",
                              "Break",
                              "InsertFootnote",
                              "InsertEndnote",
                              "Separator",
                              "Find",
                              "Separator",
                              "Comments",
                              "TrackChanges",
                              "Separator",
                              "LocalClipboard",
                              "RestrictEditing",
                              "Separator",
                              "FormFields",
                              "UpdateFields",
                          ]
                        : []
                }
                currentUser={
                    user ? `${user.firstname} ${user.lastname}` : "Guest User"
                }
                showPropertiesPane={
                    permission >= PermissionTypeEnum.edit ? true : false
                }
            >
                <Inject services={[Toolbar]}></Inject>
            </DocumentEditorContainerComponent>
        </div>
    );
}

export default DocXViewer;
