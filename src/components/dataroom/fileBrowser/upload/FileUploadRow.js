// MUI components
import {
    Avatar,
    Box,
    Typography,
    IconButton,
    TableCell,
    TableRow,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

// react hooks
import { useState, useEffect, memo } from "react";
import { formatFileSize } from "../../../../utils/fileHelper";

// custom hooks
import useUser from "../../../../hooks/useUser";

// custom config
import filetypeConfig from "../../../../configs/filetypeConfig";

// external modules
import axios from "axios";
import FormData from "form-data";

const ITEM_HEIGHT = 48;

const FileUploadRow = ({
    visible,
    dataroomId,
    file,
    depth,
    // directoryIndex,
    // subIndex,
    onUploadComplete,
    rootUploadStatus,
    onRemove,
    signedFiles,
}) => {
    // custom hooks
    const { axiosInstance } = useUser();

    const [expanded, setExpanded] = useState(false);
    // Only used by level-1 folders
    // Actually signedFiles or mySignedFiles are mutually exclusive
    // Level-1 Folders have no signedFiles inherited from parent
    const [uploadState, setUploadState] = useState({
        success: 0,
        failed: 0,
        partialSuccess: 0,
    });
    const isFolder = file.type == "folder";

    const totalUploads = isFolder ? file.children?.length : 1;

    const completeUploads =
        uploadState.success + uploadState.failed + uploadState.partialSuccess;

    const uploadComplete = completeUploads == totalUploads;

    const getUploadStatus = () => {
        if (rootUploadStatus == "PENDING") {
            return "pending";
        }

        if (rootUploadStatus == "PREPARING") {
            return "preparing";
        }

        if (rootUploadStatus == "ERROR") {
            return "prepareFailed";
        }

        let status;

        if (uploadComplete) {
            if (uploadState.failed > 0 || uploadState.partialSuccess > 0) {
                if (isFolder) {
                    status = "partialSuccess";
                } else {
                    status = "failed";
                }
            } else {
                status = "success";
            }
        } else {
            status = "uploading";
        }
        return status;
    };

    const uploadStatus = getUploadStatus();

    const onChildUploadComplete = (result) => {
        setUploadState((prevState) => {
            return { ...prevState, [result]: prevState[result] + 1 };
        });
    };

    const handleS3Upload = async (signedFile) => {
        try {
            await axios.put(signedFile.s3Url, file.data, {
                headers: {
                    "Content-Type": file.type,
                },
            });
            const form = new FormData();
            form.append("file", file.data);
            await axiosInstance.post(
                `/datarooms/${dataroomId}/files/${signedFile.fileId}/confirmUploadedWithGpt`,
                form,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setUploadState((prevState) => {
                return {
                    ...prevState,
                    success: prevState.success + 1,
                };
            });
        } catch (err) {
            console.log(err);
            setUploadState((prevState) => {
                return {
                    ...prevState,
                    failed: prevState.failed + 1,
                };
            });
        }
    };

    useEffect(() => {
        // We only call the upload API on level-1 folders and files (depth == 0) to reduce the number of API calls
        if (["success", "failed", "partialSuccess"].includes(uploadStatus)) {
            onUploadComplete(uploadStatus);
        } else if (uploadStatus == "uploading" && signedFiles[file.tempId]) {
            handleS3Upload(signedFiles[file.tempId]);
        }
    }, [uploadStatus]);

    // Get the upload icon
    let icon;
    switch (uploadStatus) {
        case "pending":
            icon = (
                <IconButton
                    onClick={() => {
                        onRemove(file.tempId);
                    }}
                >
                    <CloseIcon
                        sx={{
                            color: "red",
                        }}
                    />
                </IconButton>
            );
            break;
        case "preparing":
            icon = <CircularProgress size={16} />;
            break;
        case "uploading":
            icon = (
                <CircularProgress
                    variant="determinate"
                    size={16}
                    value={(completeUploads / totalUploads) * 100}
                />
            );
            break;
        case "success":
            icon = (
                <CheckCircleIcon
                    style={{
                        color: "green",
                    }}
                />
            );
            break;
        case "prepareFailed":
            icon = (
                <Tooltip
                    title={
                        <Typography fontSize={13}>
                            File upload fail. This is usally caused by an
                            existing file name, file size exceeds our limit, or
                            network issues.
                        </Typography>
                    }
                >
                    <ErrorIcon color="error" />
                </Tooltip>
            );
            break;
        case "failed":
            icon = (
                <Tooltip
                    title={
                        <Typography fontSize={13}>
                            File upload fail. This is usually caused by network
                            issues. Please try again and reach out to us if the
                            problem persists.
                        </Typography>
                    }
                >
                    <ErrorIcon color="error" />
                </Tooltip>
            );
            break;
        case "partialSuccess":
            icon = (
                <Tooltip
                    title={
                        <Typography fontSize={13}>
                            Partial file upload fail. This is usually caused by
                            network issues. Please try again and reach out to us
                            if the problem persists.
                        </Typography>
                    }
                >
                    <ErrorIcon color="warning" />
                </Tooltip>
            );
            break;
        default:
            icon = null;
    }

    return (
        <>
            {visible && (
                <TableRow
                    key={file._id}
                    sx={{
                        "&:last-child td, &:last-child th": {
                            border: 0,
                        },
                        "& td, & th": {
                            px: 1,
                            py: 1,
                        },
                        cursor: file.type == "folder" ? "pointer" : "default",
                    }}
                    onClick={() => {
                        if (file.type == "folder") {
                            setExpanded(!expanded);
                        }
                    }}
                >
                    {/* <TableCell
                        width="10%"
                        align="left"
                        sx={{
                            overflow: "hidden",
                        }}
                    >
                        {directoryIndex + "." + subIndex}
                    </TableCell> */}
                    <TableCell
                        align="left"
                        width="60%"
                        sx={{
                            paddingLeft: 16 + 10 * depth + "px",
                        }}
                    >
                        <Box
                            whiteSpace="no-wrap"
                            display="flex"
                            flexDirection="row"
                            justifyContent="flex-start"
                            alignItems="center"
                        >
                            <Avatar
                                variant="square"
                                sx={{
                                    width: 35,
                                    height: 35,
                                    marginRight: "1rem",
                                }}
                                src={
                                    file.type == "folder" && expanded
                                        ? "/images/filetypes/expandedFolder.svg"
                                        : file.type in filetypeConfig
                                        ? filetypeConfig[file.type].icon
                                        : filetypeConfig["default"].icon
                                }
                                className="onAppearAnimated"
                            />

                            {file.name}
                        </Box>
                    </TableCell>

                    <TableCell
                        width="30%"
                        align="left"
                        sx={{
                            overflow: "hidden",
                        }}
                    >
                        {file.size > 0 ? formatFileSize(file.size) : null}
                    </TableCell>
                    <TableCell
                        width="10%"
                        align="left"
                        sx={{
                            overflow: "hidden",
                        }}
                    >
                        {icon}
                    </TableCell>
                </TableRow>
            )}
            {file.type == "folder" &&
                file.children?.map((child, i) => {
                    return (
                        <FileUploadRow
                            visible={expanded && visible}
                            file={child}
                            key={i}
                            // directoryIndex={directoryIndex + "." + subIndex}
                            // subIndex={i + 1}
                            onRemove={onRemove}
                            depth={depth + 1}
                            onUploadComplete={onChildUploadComplete}
                            signedFiles={signedFiles}
                            rootUploadStatus={rootUploadStatus}
                            dataroomId={dataroomId}
                        />
                    );
                })}
        </>
    );
};

export default memo(FileUploadRow);
