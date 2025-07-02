import axios from "axios";
import { useRouter } from "next/router";

// MUI components
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import CompareIcon from "@mui/icons-material/Compare";
import MoveIcon from "@mui/icons-material/DriveFileMove";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import {
    Box,
    Button,
    CircularProgress,
    InputAdornment,
    Stack,
    TextField,
    Typography,
    Paper,
    Menu,
    MenuItem,
    Modal,
    Collapse,
} from "@mui/material";
import styled from "@emotion/styled";
import SearchIcon from "@mui/icons-material/Search";
import ListIcon from "@mui/icons-material/List";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import ReplyIcon from "@mui/icons-material/Reply";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import SendIcon from "@mui/icons-material/Send";
import {
    PermissionTypeEnum,
    permissionConfigMap,
} from "./fileViewer/permission-config-map";

import FileList from "./FileList";
import Ancestry from "./Ancestry";

import { useEffect, useState, useCallback, useRef } from "react";
import useAlert from "../../../hooks/useAlert";
import useUser from "../../../hooks/useUser";

import { useDropzone } from "react-dropzone";

import { v4 } from "uuid";

import useSWR from "swr";

// custom components
import ErrorPage from "../../reusableComponents/ErrorPage";
// import BackgroundFileUploader from "./legacy_BackgroundFileUploader";
import CustomFileViewer from "./fileViewer/CustomFileViewer";
import DocXViewer from "./fileViewer/DocXViewer";
import SearchFileModal from "./SearchFileModal";
import RenameFileModal from "./RenameFileModal";
import DeleteFileModal from "./DeleteFileModal";
import CreateFolderModal from "./CreateFolderModal";

// custom utils
import {
    getAncestorPaths,
    getSubIndex,
    isFile,
} from "../../../utils/fileHelper.js";
import UploaderModal from "./upload/UploaderModal";
import MoveFilesModal from "./MoveFilesModal";
import { ROLES } from "../../../configs/roleConfig";
import { PERMISSION_LEVELS } from "../../../configs/permissionConfig";
import { downloadFile } from "./utils.ts";
import lange from "@i18n";
// import AccessReportModal from "./AccessReportModal";
import { isMobile } from "react-device-detect";
import UserAccessReportModal from "@reusableComponents/dataroom/stats/UserAccessReport/UserAccessReportModal";
import dynamic from "next/dynamic";
import Summarizer from "./fileViewer/Summarizer";
import GenTranscript from "./fileViewer/GenTranscript";
import {
    ArrowDropDown,
    ArrowUpward,
    CurrencyFrancTwoTone,
    KeyboardArrowDown,
    KeyboardArrowUp,
} from "@mui/icons-material";
import DownloadModal from "./DownloadFileModal";
import { set } from "lodash";
const ResendAlertModal = dynamic(import("./components/ResendAlertModal"), {
    ssr: false,
});

const STATUSES = {
    NOT_FOUND_ERROR: -3,
    UNAUTHORIZED_ERROR: -2,
    SYSTEM_ERROR: -1,
    LOADING: 0,
    LOADED: 1,
};

const UPLOAD_STATUSES = {
    UPLOADING: 0,
    SUCCESS: 1,
    ERROR: 2,
    PARTIAL_ERROR: 3,
};

const FileFilter = styled(TextField)({
    "& .MuiInputBase-root.MuiOutlinedInput-root": {
        padding: "10px 16px",
        height: "100%",
    },
    "& .MuiInputBase-input.MuiOutlinedInput-input": {
        padding: 0,
    },
    "& .MuiInput-input.MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "rgb(0, 0, 0)", // (default alpha is 0.38)
    },
});

function Browser({ dataroomId, filePath, onSetTitle }) {
    const { permission: currentPermission } = useUser(); // Fetch the user's permission level
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen((prev) => !prev);
    };

    const router = useRouter();
    const [status, setStatus] = useState(STATUSES.LOADING);
    const [search, setSearch] = useState(false);
    const [filter, setFilter] = useState("");
    const [createFolder, setCreateFolder] = useState(false);
    const [summarizerOpen, setSummarizerOpen] = useState(false);
    const [transcriptOpen, setTranscriptOpen] = useState(false);
    const [renameFile, setRenameFile] = useState(null);
    const [moveFiles, setMoveFiles] = useState(null);
    const [deleteFiles, setDeleteFiles] = useState([]);
    const [downloadFile, setDownloadFile] = useState([]);
    const [currentFile, setCurrentFile] = useState(null);
    const [currentDirectory, setCurrentDirectory] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [accessReportFile, setAccessReportFile] = useState(null);
    const [resendAlertFiles, setResendAlertFiles] = useState([]);
    const [viewLayout, setViewLayout] = useState("grid");
    const [isCompare, setIsCompare] = useState(false);
    const [compareFiles, setCompareFiles] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [compareMode, setCompareMode] = useState();

    const [unsupportedFileModalOpen, setUnsupportedFileModalOpen] =
        useState(false);
    const [unsupportedFile, setUnsupportedFile] = useState(null);

    const reference = useRef();
    reference.current = currentFile;
    const { logout, axiosInstance } = useUser();
    const { setAlert } = useAlert();
    const [uploads, setUploads] = useState([]);
    // Get dataroom data
    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const { data: dataroomData } = useSWR(
        dataroomId ? `/datarooms/${dataroomId}` : null,
        fetcher
    );
    const dataroomRole = ROLES[dataroomData?.role];
    const availableActions = Object.values(PERMISSION_LEVELS).find(
        (permission) => permission.level == currentFile?.permission?.level
    )?.availableActions;

    const canUpload =
        availableActions?.includes("Upload") ||
        (dataroomRole?.name == "Publisher" && currentFile?.path == "/root");

    const canDelete = availableActions?.includes("Delete");

    const canReindex = availableActions?.includes("Reindex");

    const canMove = availableActions?.includes("Move");

    const canResendAlert = availableActions?.includes("Resend_Alert");

    const getLargestSubIndex = () => {
        return currentFile?.files.reduce((acc, file) => {
            const subIndex = getSubIndex(file?.index);
            if (subIndex > acc) {
                return subIndex;
            } else {
                return acc;
            }
        }, 0);
    };

    // react ref
    const ancestryRef = useRef(null);

    const ancestors = getAncestorPaths(currentFile?.path);

    const handleAllFilesSelect = useCallback(() => {
        if (selectedFiles.length == currentFile?.files?.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(currentFile?.files.map((file) => file._id) || []);
        }
    }, [selectedFiles]);

    const handleCompare = (mode) => {
        setCompareFiles([
            currentFile.files.find((file) => file._id === selectedFiles[0]),
            currentFile.files.find((file) => file._id === selectedFiles[1]),
        ]);
        setCompareMode(mode);
        // Check if both files are pdf
        if (
            !(
                currentFile.files.find((file) => file._id === selectedFiles[0])
                    .type === "application/pdf" &&
                currentFile.files.find((file) => file._id === selectedFiles[1])
                    .type === "application/pdf"
            )
        ) {
            setAlert("Only PDF files can be compared", "warning");
            return;
        }
        handleFileClick(
            currentFile.files.find((file) => file._id === selectedFiles[0]).path
        );
        setIsCompare(true);
    };

    const prepareUploads = (acceptedFiles) => {
        let uploadObject = {};
        try {
            acceptedFiles.forEach((file) => {
                const filePath = file.path.startsWith("/")
                    ? file.path
                    : "/" + file.path;
                const pathSegments = filePath
                    .split("/")
                    .filter((segment) => segment !== "");

                let currentDir = uploadObject;
                pathSegments.forEach((segment, index) => {
                    if (index == pathSegments.length - 1) {
                        // Last segment is a file
                        currentDir[segment] = {
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            data: file,
                        };
                    } else {
                        // Intermediate segment is a directory
                        if (!currentDir[segment]) {
                            currentDir[segment] = {};
                        }
                        currentDir = currentDir[segment];
                    }
                });
            });

            // Function to convert the upload object to array of files
            const convertFileObjectToArray = (key, fileObject) => {
                if (isFile(fileObject)) {
                    return { ...fileObject, tempId: v4() };
                } else {
                    // console.log(fileObject);
                    let size = 0;
                    const children = Object.keys(fileObject).map((key) => {
                        const child = convertFileObjectToArray(
                            key,
                            fileObject[key]
                        );
                        size += child.size;
                        return child;
                    });
                    return {
                        name: key,
                        type: "folder",
                        children: children,
                        size: size,
                        tempId: v4(),
                    };
                }
            };

            const uploadArray = Object.keys(uploadObject).map((key) => {
                return convertFileObjectToArray(key, uploadObject[key]);
            });
            setUploads(uploadArray);
            // console.log(uploadArray);
        } catch (err) {
            console.log(err);
            return;
        }
    };

    const { getInputProps } = useDropzone({
        onDrop: prepareUploads,
    });

    const fetchFile = async (_path) => {
        try {
            const response = await axiosInstance.get(
                `datarooms/${dataroomId}/files?path=${encodeURIComponent(
                    _path
                )}`
            );
            if (compareFiles.length > 0) {
                const responseCompare1 = await axiosInstance.get(
                    `datarooms/${dataroomId}/files?path=${encodeURIComponent(
                        compareFiles[0].path
                    )}`
                );
                const responseCompare2 = await axiosInstance.get(
                    `datarooms/${dataroomId}/files?path=${encodeURIComponent(
                        compareFiles[1].path
                    )}`
                );
                setCompareFiles([responseCompare1.data, responseCompare2.data]);
            }
            setCurrentFile(response.data);
            if (response.data?.type == "folder") {
                setCurrentDirectory(response.data?._id);
            }
            setStatus(STATUSES.LOADED);
            setSelectedFiles([]);
            setTimeout(() => {
                ancestryRef.current?.scrollTo({
                    left: ancestryRef.current?.scrollWidth,
                });
            }, 0);
        } catch (err) {
            if (err.response?.status === 404) {
                setStatus(STATUSES.NOT_FOUND_ERROR);
            } else {
                setStatus(STATUSES.SYSTEM_ERROR);
            }
        }
    };

    const handleFileClick = useCallback(
        (_path) => {
            if (!_path.includes(".")) {
                router.push(
                    `/dataroom/${dataroomId}/files?filePath=${encodeURIComponent(
                        _path
                    )}`
                );
                return;
            }
            const file = currentFile?.files.find((file) => file.path === _path);
            if (file) {
                if (!isFileSupported(file) && file.type !== "folder") {
                    // Handle unsupported file case
                    setUnsupportedFile(file);
                    setUnsupportedFileModalOpen(true);
                } else {
                    // Open the file in the viewer
                    router.push(
                        `/dataroom/${dataroomId}/files?filePath=${encodeURIComponent(
                            _path
                        )}`
                    );
                }
            }
        },
        [dataroomId, currentFile]
    );

    const WEBVIEWER_SUPPORTED_FILE_EXTENSIONS = [
        //PDF
        "application/pdf",

        // Microsoft Office
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",

        "application/rtf",
        // Images
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/tiff",
        "image/svg+xml",

        // Plain Text and Markup
        "text/plain",
        "text/html",
        "text/markdown",
        "application/json",
        "application/xml",
        "application/javascript",

        // CAD Formats (Requires configuration/plugins)
        "application/vnd.dwg",
        "application/vnd.dxf",

        // Videos (If configured)
        "video/mp4",
        "video/webm",
        "video/ogg",

        // Audio (If configured)
        "audio/mpeg",
    ];

    const isFileSupported = (file) => {
        return WEBVIEWER_SUPPORTED_FILE_EXTENSIONS.includes(file.type);
    };

    const handleFileSelect = (fileId, selected) => {
        if (selected) {
            if (selectedFiles.indexOf(fileId) < 0)
                setSelectedFiles([...selectedFiles, fileId]);
        } else {
            let newArray = [...selectedFiles];
            let index = newArray.indexOf(fileId);
            if (index >= 0) {
                newArray.splice(index, 1);
                setSelectedFiles(newArray);
            }
        }
    };

    const handleFileMove = async (directory) => {
        try {
            if (directory == currentFile.path) {
                setAlert("Cannot move file to the same directory", "warning");
                return;
            }
            const result = await axiosInstance.patch(
                `datarooms/${dataroomId}/files/move`,
                {
                    files: moveFiles,
                    directory,
                }
            );
            setCurrentFile((prevState) => {
                return {
                    ...prevState,
                    files: prevState.files.filter(
                        (file) =>
                            result.data?.successFiles?.indexOf(file._id) < 0
                    ),
                };
            });
            if (
                result.data?.successFiles?.length > 0 &&
                result.data?.failedFiles?.length == 0
            ) {
                setAlert("File moved successfully", "success");
            } else if (
                result.data?.successFiles?.length > 0 &&
                result.data?.failedFiles?.length > 0
            ) {
                setAlert(
                    "Some files could not be moved due to existing filenames or network error",
                    "warning"
                );
            } else {
                setAlert(
                    "Files could not be moved due to existing filenames or network error",
                    "warning"
                );
            }
            setSelectedFiles([]);
            setMoveFiles(null);
        } catch (err) {
            setAlert("File move failed", "error");
        }
    };

    const handleAllFilesReindex = async () => {
        try {
            const result = await axiosInstance.patch(
                `datarooms/${dataroomId}/files/${currentFile?._id}/reindex`
            );
            fetchFile(reference.current.path);
            setAlert("File reindex successfully", "success");
        } catch (err) {
            setAlert("File reindex failed", "error");
        }
    };

    const handleFileReindex = async (fileId, newOrder) => {
        try {
            const result = await axiosInstance.patch(
                `datarooms/${dataroomId}/files/${fileId}/reorder`,
                {
                    newOrder: newOrder,
                }
            );
            fetchFile(reference.current.path);
            setAlert("File reindex successfully", "success");
        } catch (err) {
            setAlert("File reindex failed", "error");
        }
    };

    const handleFileDelete = useCallback(
        (_fileId) => {
            let files = _fileId ? [_fileId] : [...selectedFiles];
            let _files = files.map((item) => {
                return {
                    id: item,
                    name: currentFile?.files.find((ids) => ids._id === item)
                        ?.name,
                };
            });
            setDeleteFiles(_files);
        },
        [dataroomId, selectedFiles]
    );

    const deleteSuccess = (successFiles) => {
        setCurrentFile((prevState) => {
            return {
                ...prevState,
                files: prevState.files.filter(
                    (file) => successFiles?.indexOf(file._id) < 0
                ),
            };
        });
        setDeleteFiles([]);
        selectedFiles.length > 0 && setSelectedFiles([]);
    };
    const handleFileDownload = useCallback(
        (_fileId) => {
            let itemIds = _fileId ? [_fileId] : [...selectedFiles];

            // Separate files and folders
            let downloadFiles = [];
            let downloadFolders = [];

            itemIds.forEach((itemId) => {
                const item = currentFile?.files.find(
                    (file) => file._id === itemId
                );
                if (item) {
                    if (item.isFolder || item.type === "folder") {
                        downloadFolders.push(item);
                    } else {
                        downloadFiles.push(item);
                    }
                }
            });

            setDownloadFile({
                files: downloadFiles,
                folders: downloadFolders,
            });
        },
        [dataroomId, selectedFiles, currentFile]
    );

    const handleRemoveFileUpload = useCallback((_tempId) => {
        const getUpdatedUploads = (uploads) => {
            return uploads.reduce((acc, upload) => {
                if (upload.tempId == _tempId) {
                    return acc;
                } else {
                    if (upload.type == "folder") {
                        // Get the child with the tempId if it exists
                        const child = upload.children.find(
                            (child) => child.tempId == _tempId
                        );

                        return [
                            ...acc,
                            {
                                ...upload,
                                size: child
                                    ? upload.size - child.size
                                    : upload.size,
                                children: getUpdatedUploads(upload.children),
                            },
                        ];
                    } else {
                        return [...acc, upload];
                    }
                }
            }, []);
        };

        setUploads((prevState) => {
            return getUpdatedUploads(prevState);
        });
    }, []);

    const handleViewChange = () => {
        setViewLayout(viewLayout === "grid" ? "list" : "grid");
    };

    const onSearch = async (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            try {
                const response = await axiosInstance.get(
                    `datarooms/${dataroomId}/files/search?keyword=${filter}`
                );
                setCurrentFile({ ...currentFile, files: response.data });
                setStatus(STATUSES.LOADED);
                setSelectedFiles([]);
                ancestryRef.current?.scrollTo({
                    left: ancestryRef.current?.scrollWidth,
                });
            } catch (err) {
                if (err.response?.status === 404) {
                    setStatus(STATUSES.NOT_FOUND_ERROR);
                } else {
                    setStatus(STATUSES.SYSTEM_ERROR);
                }
            }
        }
    };

    useEffect(() => {
        if (dataroomId) {
            setStatus(STATUSES.LOADING);
            fetchFile(decodeURIComponent(filePath));
        }
        if (filePath && isMobile) {
            let _filePath = filePath.split("/");
            let title =
                filePath != "/root" ? _filePath[_filePath.length - 1] : "";
            // onSetTitle(title);
        }
        if (selectedFiles.length != 2) {
            setIsCompare(false);
        }
    }, [dataroomId, filePath]);
    if (status === STATUSES.UNAUTHORIZED_ERROR) {
        return <ErrorPage message="You are not permitted to enter this page" />;
    } else if (status === STATUSES.NOT_FOUND_ERROR) {
        return (
            <ErrorPage
                message="File not found - Non-existing file path or deleted file"
                severity="warning"
            />
        );
    } else if (status === STATUSES.SYSTEM_ERROR) {
        return (
            <ErrorPage message="Something went wrong. Please try again later." />
        );
    } else {
        return (
            <Box
                display="flex"
                flexDirection="column"
                p={isMobile ? 0 : 6}
                pt={isMobile ? 2 : 6}
                position="relative"
                width="100%"
                // px={!isMobile && 2}
            >
                {ancestors.length > 1 && (
                    <Box
                        sx={
                            isMobile && {
                                position: "fixed",
                                zIndex: 1200,
                                top: "120px",
                                left: "20px",
                            }
                        }
                        mb={1}
                    >
                        <Button
                            onClick={() => {
                                handleFileClick(
                                    ancestors[ancestors.length - 2]
                                );
                            }}
                            sx={{
                                typography: "h6",
                                cursor: "pointer",
                                textTransform: "none",
                            }}
                            startIcon={<ReplyIcon />}
                        >
                            Back to{" "}
                            {ancestors.length == 2
                                ? "All Folders"
                                : ancestors[ancestors.length - 2]
                                      .split("/")
                                      .pop()}
                        </Button>
                    </Box>
                )}
                <Box display="flex" flexDirection="row" width="100%" gap={2}>
                    {!isMobile && (
                        <Box maxWidth="40%" overflow="auto" ref={ancestryRef}>
                            <Ancestry
                                highlightLast={true}
                                onAncestorClick={handleFileClick}
                                path={currentFile?.path}
                            />
                        </Box>
                    )}
                    {
                        // For summarizer temp use (Only support pdf file)
                        currentFile?.type == "application/pdf" &&
                            !isCompare && (
                                <Box ml="auto">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SummarizeIcon />}
                                        component="label"
                                        sx={{
                                            flex: "none",
                                        }}
                                        onClick={() => setSummarizerOpen(true)}
                                    >
                                        AI Summary
                                    </Button>
                                </Box>
                            )
                    }
                    {
                        // For speech to text use (Only support mp3,mp4 file)
                        (currentFile?.type == "video/mp4" ||
                            currentFile?.type == "audio/mpeg") && (
                            <Box ml="auto">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AudioFileIcon />}
                                    component="label"
                                    sx={{
                                        flex: "none",
                                    }}
                                    onClick={() => setTranscriptOpen(true)}
                                >
                                    AI Gen Transcript
                                </Button>
                            </Box>
                        )
                    }
                    {currentFile?.type == "folder" && !isMobile && (
                        <Box
                            sx={{
                                overflowX: "auto",
                                maxWidth: !isMobile ? "80%" : "auto",
                            }}
                            ml={isMobile ? "0" : "auto"}
                            maxWidth={!isMobile ? "80%" : "auto"}
                        >
                            <Stack
                                direction="row"
                                spacing={2}
                                sx={{ overflowX: "auto" }}
                                alignItems="center"
                            >
                                {selectedFiles.length > 0 && (
                                    <Button
                                        variant="contained"
                                        color="neutral"
                                        component="label"
                                        sx={{
                                            flex: "none",
                                        }}
                                        onClick={() => setSelectedFiles([])}
                                    >
                                        {selectedFiles.length +
                                            " " +
                                            lange("Selected")}
                                    </Button>
                                )}

                                {/* DownloadAll Button */}
                                {selectedFiles.length > 0 && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        component="label"
                                        sx={{
                                            flex: "none",
                                        }}
                                        onClick={() => handleFileDownload()}
                                    >
                                        {lange("Download")}
                                    </Button>
                                )}
                                {selectedFiles.length > 0 && canDelete && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        component="label"
                                        sx={{
                                            flex: "none",
                                        }}
                                        onClick={() => handleFileDelete()}
                                    >
                                        {lange("Delete")}
                                    </Button>
                                )}
                                {status === STATUSES.LOADED &&
                                    selectedFiles.length == 2 && (
                                        <>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<CompareIcon />}
                                                component="label"
                                                sx={{
                                                    flex: "none",
                                                }}
                                                endIcon={<ArrowDropDown />}
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    setAnchorEl(
                                                        event.currentTarget
                                                    );
                                                }}
                                            >
                                                {lange("Compare")}
                                            </Button>

                                            <Menu
                                                anchorEl={anchorEl}
                                                open={Boolean(anchorEl)}
                                                onClose={() =>
                                                    setAnchorEl(null)
                                                }
                                            >
                                                <MenuItem
                                                    onClick={() => {
                                                        handleCompare("text");
                                                        setAnchorEl(null);
                                                    }}
                                                >
                                                    Text PDF Compare
                                                </MenuItem>
                                                <MenuItem
                                                    onClick={() => {
                                                        handleCompare("scan");
                                                        setAnchorEl(null);
                                                    }}
                                                >
                                                    Scanned PDF Compare
                                                </MenuItem>
                                            </Menu>
                                        </>
                                    )}
                                {selectedFiles.length > 0 && canMove && (
                                    <Button
                                        variant="contained"
                                        startIcon={<MoveIcon />}
                                        component="label"
                                        color="primary"
                                        sx={{
                                            flex: "none",
                                        }}
                                        onClick={() =>
                                            setMoveFiles(selectedFiles)
                                        }
                                    >
                                        {lange("Move")}
                                    </Button>
                                )}

                                {selectedFiles.length > 0 && canResendAlert && (
                                    <Button
                                        variant="contained"
                                        startIcon={<SendIcon />}
                                        component="label"
                                        sx={{
                                            flex: "none",
                                        }}
                                        onClick={() =>
                                            setResendAlertFiles(
                                                selectedFiles.map((fileId) =>
                                                    currentFile?.files.find(
                                                        (file) =>
                                                            file._id == fileId
                                                    )
                                                )
                                            )
                                        }
                                    >
                                        {lange("Resend_Alert")}
                                    </Button>
                                )}

                                {selectedFiles.length == 0 && canReindex && (
                                    <Button
                                        variant="contained"
                                        component="label"
                                        onClick={handleAllFilesReindex}
                                        sx={{
                                            flex: "none",
                                        }}
                                        startIcon={<ListIcon />}
                                    >
                                        {lange("Reindex")}
                                    </Button>
                                )}

                                {selectedFiles.length == 0 && canUpload && (
                                    <Button
                                        variant="contained"
                                        startIcon={<CreateNewFolderIcon />}
                                        component="label"
                                        sx={{
                                            flex: "none",
                                        }}
                                        onClick={() => setCreateFolder(true)}
                                    >
                                        {lange("Create_Folder")}
                                    </Button>
                                )}

                                {selectedFiles.length == 0 && canUpload && (
                                    <Button
                                        variant="contained"
                                        startIcon={<FileUploadIcon />}
                                        component="label"
                                        sx={{
                                            flex: "none",
                                        }}
                                    >
                                        {lange("Upload")}
                                        <input {...getInputProps()} />
                                    </Button>
                                )}
                                {!isMobile && (
                                    <FileFilter
                                        InputLabelProps={{
                                            shrink: true,
                                            style: { display: "none" },
                                        }}
                                        placeholder={lange("Search_File_Name")}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        onClick={() => setSearch(true)}
                                        onChange={() => {}}
                                        name="filter"
                                        sx={{
                                            flex: "none",
                                        }}
                                    />
                                )}
                            </Stack>
                        </Box>
                    )}
                </Box>
                {isMobile && currentFile?.type == "folder" && (
                    <Box
                        sx={{
                            position: "fixed",
                            zIndex: 1200,
                            top: "120px",
                            right: 0,
                            paddingRight: "20px",
                            textAlign: "right",
                            height: "25px",
                            background: "#fff",
                        }}
                    >
                        {viewLayout === "grid" ? (
                            <ViewListIcon
                                fontSize={"large"}
                                onClick={handleViewChange}
                            />
                        ) : (
                            <CalendarViewMonthIcon
                                fontSize={"large"}
                                onClick={handleViewChange}
                            />
                        )}
                    </Box>
                )}
                {isMobile && currentFile?.type == "folder" && (
                    <FileFilter
                        InputLabelProps={{
                            shrink: true,
                            style: { display: "none" },
                        }}
                        placeholder="Search File name"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        onClick={() => setSearch(!isMobile)}
                        onChange={(e) => {
                            setFilter(e.target.value);
                        }}
                        onKeyDown={onSearch}
                        name="filter"
                        sx={{
                            flex: "none",
                            position: "fixed",
                            top: "145px",
                            zIndex: 1200,
                            background: "#fff",
                            left: 0,
                            right: 0,
                            padding: "10px 20px",
                        }}
                    />
                )}
                {isMobile && currentFile?.type == "folder" && canUpload && (
                    <Box
                        sx={{
                            position: "fixed",
                            bottom: 0,
                            left: 0,
                            width: "100vw",
                            minWidth: "100vw",
                            backgroundColor: "#E8E8E8",
                            zIndex: 1000,
                            borderRadius: "30px",
                        }}
                    >
                        <Button
                            onClick={handleClick}
                            sx={{
                                width: "100%",
                                borderRadius: 0,
                                backgroundColor: "#E0E0E0",
                                color: "black",
                            }}
                        >
                            {open ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
                        </Button>

                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box
                                sx={{
                                    maxWidth: "100vw",
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    borderRadius: "0px 0px 8px 8px",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    startIcon={<FileUploadIcon />}
                                    component="label"
                                    sx={{
                                        borderRadius: "20px",
                                    }}
                                >
                                    {lange("Upload")}
                                    <input {...getInputProps()} />
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<CreateNewFolderIcon />}
                                    component="label"
                                    sx={{
                                        borderRadius: "20px",
                                    }}
                                    onClick={() => setCreateFolder(true)}
                                >
                                    {lange("Create_Folder")}
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleAllFilesReindex}
                                    sx={{
                                        borderRadius: "20px",
                                    }}
                                    startIcon={<ListIcon />}
                                >
                                    {lange("Reindex")}
                                </Button>
                            </Box>
                        </Collapse>
                    </Box>
                )}
                <Paper
                    sx={{
                        // height: "100%",
                        width: "100%",
                        position: "relative",
                        overflow: "hidden",
                        marginTop:
                            isMobile && currentFile?.type === "folder"
                                ? "56px"
                                : "1.5rem",
                        zIndex: 99,
                        boxShadow: isMobile && "none",
                    }}
                >
                    {status === STATUSES.LOADING && (
                        <Box
                            display="flex"
                            position="absolute"
                            justifyContent="center"
                            alignItems="center"
                            width="100%"
                            height="100%"
                        >
                            <Typography variant="h5">
                                <CircularProgress size={50} />
                            </Typography>
                        </Box>
                    )}

                    {status === STATUSES.LOADED &&
                        currentFile &&
                        currentFile?.type === "folder" && (
                            <FileList
                                viewLayout={viewLayout}
                                files={currentFile?.files}
                                selectedFiles={selectedFiles}
                                onAllFilesSelect={handleAllFilesSelect}
                                onFileSelect={handleFileSelect}
                                onFilesDrop={prepareUploads}
                                onFileClick={handleFileClick}
                                onFileDelete={(fileId, fileName) => {
                                    setDeleteFiles([
                                        {
                                            id: fileId,
                                            name: fileName,
                                        },
                                    ]);
                                }}
                                onFileReindex={handleFileReindex}
                                onFileRename={(fileId, fileName) =>
                                    setRenameFile({
                                        id: fileId,
                                        name: fileName,
                                    })
                                }
                                onFileMove={(fileId) => setMoveFiles([fileId])}
                                uploadDisabled={!canUpload}
                                selectDisabled={false}
                                onDownload={handleFileDownload}
                                onOpenAccessReport={(fileId) => {
                                    setAccessReportFile(
                                        currentFile?.files.find(
                                            (file) => file._id == fileId
                                        )
                                    );
                                }}
                                onOpenResendAlert={(fileId) => {
                                    setResendAlertFiles(
                                        currentFile?.files.filter(
                                            (file) => file._id == fileId
                                        )
                                    );
                                }}
                                reindexDisabled={false}
                                role={dataroomRole}
                            />
                        )}
                    {status === STATUSES.LOADED &&
                        currentFile &&
                        currentFile.type !== "folder" && (
                            <CustomFileViewer
                                permission={currentFile?.permission?.level}
                                fileOrFiles={
                                    isCompare ? compareFiles : currentFile
                                }
                                dataroomId={dataroomId}
                                isCompare={isCompare}
                                compareMode={compareMode}
                            ></CustomFileViewer>
                        )}
                </Paper>
                {/*                                 
                    Below are all the modals
                */}

                {unsupportedFileModalOpen && (
                    <Modal
                        open={unsupportedFileModalOpen}
                        onClose={() => setUnsupportedFileModalOpen(false)}
                    >
                        <Box
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                padding: 20,
                                backgroundColor: "white",
                                borderRadius: 8,
                                boxShadow: 24,
                                minWidth: "300px", // Minimum width for the modal
                                maxWidth: "500px", // Maximum width
                                maxHeight: "400px", // Optional height limit
                                textAlign: "center",
                                position: "relative", // Allow positioning for the button
                                display: "flex",
                                flexDirection: "column", // Stack content vertically
                                justifyContent: "flex-start", // Keep items starting from the top
                                height: "auto", // Allow dynamic height based on content
                            }}
                        >
                            <Typography variant="h6" gutterBottom>
                                The selected file is not supported
                            </Typography>

                            {currentFile?.permission?.level >=
                            PermissionTypeEnum.download_raw ? (
                                <Button
                                    onClick={handleDownload}
                                    style={{
                                        position: "absolute",
                                        bottom: 20, // Stick it near the bottom of the modal
                                        right: 20, // Align it to the right
                                        backgroundColor: "#007BFF",
                                        color: "white",
                                        fontWeight: "bold",
                                        textTransform: "none",
                                    }}
                                >
                                    Download
                                </Button>
                            ) : (
                                <Typography
                                    variant="body1"
                                    color="error"
                                    style={{ marginTop: 20 }}
                                >
                                    You do not have permission to download this
                                    file.
                                </Typography>
                            )}
                        </Box>
                    </Modal>
                )}
                {uploads?.length > 0 && (
                    <UploaderModal
                        currentFileId={currentFile?._id}
                        dataroomId={dataroomId}
                        uploads={uploads}
                        onFileRemove={handleRemoveFileUpload}
                        onClose={() => {
                            fetchFile(reference.current.path);
                            setUploads([]);
                        }}
                        existingFileNames={
                            currentFile?.files.map((file) => file.name) || []
                        }
                        open={uploads?.length > 0}
                    />
                )}
                {/** Keep the state */}
                <SearchFileModal
                    dataroomId={dataroomId}
                    open={search}
                    onClose={() => setSearch(false)}
                    onFileClick={handleFileClick}
                    onFileDelete={handleFileDelete}
                    onFileRename={(fileId, fileName) =>
                        setRenameFile({
                            id: fileId,
                            name: fileName,
                        })
                    }
                />
                <UserAccessReportModal
                    dataroomId={dataroomId}
                    open={!!accessReportFile}
                    onClose={() => setAccessReportFile(null)}
                    file={accessReportFile}
                />
                {!!resendAlertFiles.length && (
                    <ResendAlertModal
                        dataroomId={dataroomId}
                        open={!!resendAlertFiles.length}
                        onClose={() => setResendAlertFiles([])}
                        onSuccess={() => setResendAlertFiles([])}
                        files={resendAlertFiles}
                    />
                )}
                {/** Add conditional rendering to reset everytime */}
                {moveFiles != null && (
                    <MoveFilesModal
                        filesToMove={moveFiles.map((fileId) => {
                            return currentFile?.files.find(
                                (file) => file._id == fileId
                            );
                        })}
                        dataroomId={dataroomId}
                        open={moveFiles != null}
                        onClose={() => setMoveFiles(null)}
                        onSubmit={(dir) => {
                            handleFileMove(dir);
                        }}
                        oldPath={currentFile?.path}
                    />
                )}
                {/** Add conditional rendering to reset everytime */}
                {renameFile != null && (
                    <RenameFileModal
                        dataroomId={dataroomId}
                        open={renameFile != null}
                        fileId={renameFile.id}
                        fileName={renameFile.name}
                        onRenameSuccess={(renamedFile) => {
                            // console.log("renamedFile", renamedFile);
                            setCurrentFile((prevState) => {
                                return {
                                    ...prevState,
                                    files: prevState.files.map((file) => {
                                        if (file._id == renamedFile._id) {
                                            file.path = renamedFile.path;
                                            file.name = renamedFile.name;
                                        }
                                        return file;
                                    }),
                                };
                            });
                        }}
                        onClose={() => setRenameFile(null)}
                    />
                )}
                {!!deleteFiles.length && (
                    <DeleteFileModal
                        dataroomId={dataroomId}
                        open={!!deleteFiles.length}
                        files={deleteFiles}
                        onDeleteSuccess={deleteSuccess}
                        onClose={() => setDeleteFiles([])}
                    />
                )}

                {/* downloadFileModal */}
                {downloadFile &&
                    (downloadFile.files?.length > 0 ||
                        downloadFile.folders?.length > 0) && (
                        <DownloadModal
                            open={true}
                            onClose={() => setDownloadFile(null)}
                            files={downloadFile.files || []}
                            folders={downloadFile.folders || []}
                            dataroomId={dataroomId}
                        />
                    )}
                {/** Add conditional rendering to reset everytime */}
                {createFolder && (
                    <CreateFolderModal
                        dataroomId={dataroomId}
                        open={createFolder}
                        directory={currentFile?._id}
                        onCreateSuccess={(folder) => {
                            fetchFile(reference.current.path);
                        }}
                        index={
                            (currentFile?.index || "") +
                            "." +
                            (getLargestSubIndex() + 1)
                        }
                        onClose={() => setCreateFolder(false)}
                    />
                )}
                {currentFile?.type == "application/pdf" && (
                    <Summarizer
                        open={summarizerOpen}
                        onClose={() => {
                            setSummarizerOpen(false);
                        }}
                        fileId={currentFile?._id}
                    />
                )}
                {(currentFile?.type == "video/mp4" ||
                    currentFile?.type == "audio/mpeg") && (
                    <GenTranscript
                        open={transcriptOpen}
                        onClose={() => {
                            setTranscriptOpen(false);
                        }}
                        canUpload={canUpload}
                        fileId={currentFile?._id}
                        fileDirectory={currentDirectory}
                        fileName={currentFile?.name}
                    />
                )}
            </Box>
        );
    }
}

export default Browser;
