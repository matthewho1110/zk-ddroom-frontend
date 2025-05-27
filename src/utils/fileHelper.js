const extensionLists = {}; //Create an object for all extension lists
extensionLists.video = ["m4v", "avi", "mpg", "mp4", "webm"];
extensionLists.image = ["jpg", "jpeg", "gif", "png", "webp"];

// One validation function for all file types
function isValidFileType(fName, fType) {
    return (
        extensionLists[fType].indexOf(fName.split(".").pop().toLowerCase()) > -1
    );
}

function getPureFilename(fName) {
    return fName.substring(0, fName.lastIndexOf(".")) || fName;
}

function formatFileSize(size, decimal = 1) {
    let units = [" B", " KB", " MB", " GB", " TB"],
        bytes = size,
        i;

    for (i = 0; bytes >= 1024 && i < 4; i++) {
        bytes /= 1024;
    }

    return bytes?.toFixed(decimal) + units[i];
}

const gbToBytes = (gb) => gb * 1024 ** 3;
// 5 decimal places
const bytesToGb = (bytes) => Math.round((bytes / 1024 ** 3) * 100000) / 100000;

// Determine the order of files and folders
function compare(a, b) {
    if (a.type !== "folder" && b.type !== "folder") {
        return b.size - a.size;
    } else if (a.type === "folder" && b.type === "folder") {
        return b.child.length - a.child.length;
    } else {
        return a.type === "folder" ? -1 : 1;
    }
}

// Obsolete
const isFile = (obj) => {
    return (
        obj &&
        obj.hasOwnProperty("size") &&
        obj.hasOwnProperty("name") &&
        obj.hasOwnProperty("type")
    );
};

function getSubIndex(index) {
    // return in integer
    return parseInt(index.split(".").pop());
}

function getAncestorPaths(path) {
    let currentPath = "";
    let ancestors = path
        ? path
              .replace(/\/+$/, "")
              .split("/")
              .filter((x) => x != "")
        : [];

    ancestors = ancestors.map((ancestor, index) => {
        let path = currentPath;
        path += "/";
        path += ancestor;
        currentPath = path;
        return path;
    });
    return ancestors;
}

module.exports = {
    isValidFileType,
    getPureFilename,
    formatFileSize,
    compare,
    isFile,
    getSubIndex,
    getAncestorPaths,
    gbToBytes,
    bytesToGb,
};
