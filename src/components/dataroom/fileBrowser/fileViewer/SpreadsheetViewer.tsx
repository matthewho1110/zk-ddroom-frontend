import React, { useEffect, useRef, useState } from "react";
import {
    Inject,
    SpreadsheetComponent,
} from "@syncfusion/ej2-react-spreadsheet";
import useAlert from "@hooks/useAlert";
import useUser from "@hooks/useUser";
import axios from "axios";
import XLSX from "xlsx";
import { PermissionTypeEnum } from "./permission-config-map";
import { downloadFile } from "../utils";

function SpreadsheetViewer({
    file,
    permission,
}: {
    file: any;
    permission: any;
}) {
    const [isSaveOnly, setIsSaveOnly] = useState(false);
    const spreadsheetRef = useRef<SpreadsheetComponent>(null);
    const { axiosInstance } = useUser();
    const { setAlert } = useAlert();

    const loadSpreadsheet = async () => {
        fetch(file.tempUri).then((response) => {
            response.blob().then((fileBlob) => {
                var f = new File([fileBlob], file.name); //convert the blob into file
                spreadsheetRef.current?.open({ file: f }); // open the file into Spreadsheet
            });
        });
        spreadsheetRef.current?.addToolbarItems(
            "Home",
            [
                {
                    prefixIcon: "e-save",
                    tooltipText: "Save",
                    text: "Save",
                    // Set the click handler for the Save button
                    click: (): void => {
                        onSave();
                    },
                },
                {
                    prefixIcon: "e-download",
                    tooltipText: "Download",
                    text: "Download",
                    // Set the click handler for the Save button
                    click: (): void => {
                        onDownload();
                    },
                },
                { type: "Separator" },
            ],
            0
        );

        if (permission < PermissionTypeEnum.edit) {
            // remove ribbon
            spreadsheetRef.current?.hideRibbonTabs([
                "Home",
                "Insert",
                "Data",
                "View",
                "Formulas",
            ]);
        }
    };

    const onDownload = async () => {
        downloadFile(file.tempUri, file.name);
    };

    const onSave = async () => {
        try {
            if (spreadsheetRef.current) {
                // @ts-ignore
                setIsSaveOnly(true);

                setTimeout(() => {
                    if (spreadsheetRef.current) {
                        spreadsheetRef.current.save({
                            fileName: file.name || "Spreadsheet.xlsx",
                            saveType: "Xlsx",
                        });
                    }
                }, 100);
            }
        } catch (err) {
            console.error(err);
            setAlert(
                // @ts-ignore
                "An error occurred while saving the spreadsheet.",
                "error"
            );
        }
    };

    const handleBeforeOpen = async (args: any) => {
        if (spreadsheetRef.current) {
            // @ts-ignore
            spreadsheetRef.current.showSheetTabs = true;
            spreadsheetRef.current.height = `${window.innerHeight}px`;
        }
    };

    const handleBeforeSave = async (args: any) => {
        try {
            if (spreadsheetRef.current) {
                spreadsheetRef.current.showSpinner();
            }
            if (isSaveOnly) {
                args.needBlobData = true;
                setIsSaveOnly(false);
            } else {
                args.needBlobData = false;
                if (permission >= PermissionTypeEnum.edit) {
                    onSave();
                }
            }
            args.cancel = false;
        } catch (err) {
            console.error(err);
            setAlert(
                // @ts-ignore
                "An error occurred while saving the spreadsheet.",
                "error"
            );
        }
    };

    const handleSaveComplete = async (args: any) => {
        try {
            const blob = args.blobData;

            // Create a File object from the Blob
            const updatedFile = new File([blob], file.name, {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            // Upload the updated file to the server
            const putUrl = (
                await axiosInstance.patch(
                    `/datarooms/${file.dataroom}/files/${file._id}/edit`,
                    {
                        newFileName: updatedFile.name,
                        newFileType: updatedFile.type,
                        newFileSize: updatedFile.size,
                    }
                )
            ).data.signedPutUrl;

            // Use axios to upload the updated file
            await axios.put(putUrl, updatedFile, {
                headers: {
                    "Content-Type": updatedFile.type,
                },
            });
            if (spreadsheetRef.current) {
                spreadsheetRef.current.hideSpinner();
            }
            // @ts-ignore
            setAlert("Spreadsheet has been saved.", "success");
        } catch (err) {
            console.error(err);
            setAlert(
                // @ts-ignore
                "An error occurred while saving the spreadsheet.",
                "error"
            );
        }
    };

    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;

        const updateHeight = (): void => {
            clearTimeout(resizeTimeout);
            // if the current spreadsheet is not on window.innerHeight, set the height to window.innerHeight
            resizeTimeout = setTimeout(() => {
                if (spreadsheetRef.current) {
                    spreadsheetRef.current.setProperties({
                        height: `${window.innerHeight}px`,
                    }); // Refresh spreadsheet layout
                }
            }, 100); // Debounce time
        };

        window.addEventListener("resize", updateHeight);

        return () => {
            clearTimeout(resizeTimeout);
            window.removeEventListener("resize", updateHeight);
        };
    }, []);

    return (
        <div className="App">
            <style>
                {`
                @import url("https://cdn.syncfusion.com/ej2/20.3.56/bootstrap5.css");
                `}
            </style>
            <SpreadsheetComponent
                showSheetTabs={true}
                height={
                    window.innerHeight ? `${window.innerHeight}px` : "800px"
                }
                width="100%"
                allowOpen={true}
                openUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/open"
                created={loadSpreadsheet}
                saveUrl="https://ej2services.syncfusion.com/production/web-services/api/spreadsheet/save"
                ref={spreadsheetRef}
                allowEditing={permission >= PermissionTypeEnum.edit}
                beforeOpen={handleBeforeOpen}
                beforeSave={handleBeforeSave}
                fileMenuBeforeOpen={() => {
                    spreadsheetRef.current?.hideFileMenuItems(["Open", "New"]);
                }}
                showRibbon={permission >= PermissionTypeEnum.download_encrypted}
                showFormulaBar={permission >= PermissionTypeEnum.edit}
                saveComplete={handleSaveComplete}
            />
        </div>
    );
}

export default SpreadsheetViewer;
