export const binaryToFile = (
    buffer: ArrayBuffer,
    fileName: string,
    fileType: string
) => {
    const blob = new Blob([buffer], {
        type: fileType,
    });
    const newFile = new File([blob], fileName, {
        type: fileType,
    });

    return newFile;
};

// export const getS3PutUrl = async ({
//     did,
//     fileId,
// }: {
//     did: string;
//     fileId: string;
// }) => {
//     return (
//         await axiosInstance?.get(
//             `/datarooms/${did}/files/${fileId}/getSignedPutUrl`
//         )
//     ).data.signedPutUrl;
// };

// * write a function to download blob as file
export const downloadBlob = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
};

// * write a function to download File
export const jsDownloadFile = (file: File) => {
    // * convert File to Blob
    const blob = new Blob([file], { type: file.type });
    return downloadBlob(blob, file.name);
};

export function downloadFile(url: string, filename: string) {
    fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
            // Create a new anchor element
            const anchor = document.createElement("a");

            // Set the href and download attributes using the provided filename
            anchor.setAttribute("href", URL.createObjectURL(blob));
            anchor.setAttribute("download", filename);

            // Simulate a click on the anchor element
            anchor.click();
        });
}

export function downloadBufferAsPdf(buffer: ArrayBuffer, filename: string) {
    const blob = new Blob([buffer], { type: "application/pdf" });
    // Create a new anchor element
    const anchor = document.createElement("a");

    // Set the href and download attributes using the provided filename
    anchor.setAttribute("href", URL.createObjectURL(blob));
    anchor.setAttribute("download", filename);

    // Simulate a click on the anchor element
    anchor.click();
}
