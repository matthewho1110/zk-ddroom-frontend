import { WebViewerOptions } from "@pdftron/webviewer";

export enum PermissionTypeEnum {
    read = 1,
    download_encrypted = 2,
    download_pdf = 3,
    download_raw = 4,
    edit = 5,
}

export const permissionConfigMap: Record<
    PermissionTypeEnum,
    Partial<WebViewerOptions>
> = {
    [PermissionTypeEnum.read]: {
        // * disable all tools
        // * disable menu button, panel, panel button, select button
        disabledElements: ["leftPanel", "leftPanelButton", "selectToolButton"],

        enableFilePicker: false,
        isReadOnly: true,
        loadAsPDF: true,
        enableAnnotations: false,
    },
    [PermissionTypeEnum.download_encrypted]: {
        // * disable all tools
        // * disable menu button, panel, panel button, select button
        disabledElements: ["leftPanel", "leftPanelButton"],
        enableFilePicker: false,
        isReadOnly: true,
        loadAsPDF: true,
        enableAnnotations: false,
    },
    [PermissionTypeEnum.download_pdf]: {
        // * disable all tools
        // * disable menu button, panel, panel button, select button
        disabledElements: ["leftPanel", "leftPanelButton"],
        enableFilePicker: false,
        isReadOnly: true,
        loadAsPDF: true,
        enableAnnotations: false,
    },
    [PermissionTypeEnum.download_raw]: {
        // * disable all tools
        // * disable menu button, panel, panel button, select button
        disabledElements: ["leftPanel", "leftPanelButton"],
        enableFilePicker: false,
        isReadOnly: true,
        loadAsPDF: true,
        enableAnnotations: false,
    },
    [PermissionTypeEnum.edit]: {
        disabledElements: ["leftPanel", "leftPanelButton"],
        loadAsPDF: true,
        isReadOnly: false,
        enableAnnotations: true,
        enableRedaction: true,
    },
};
