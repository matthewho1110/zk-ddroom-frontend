import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    styled,
    List,
    ListItem,
    ListItemText,
    LinearProgress,
    Box,
    Typography,
    Paper,
    Divider,
    Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import useAlert from "../../../hooks/useAlert";
import axios from "axios";

const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paper": {
        minWidth: 450,
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(2),
    },
}));

const ProgressContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
}));

const formatTime = (seconds) => {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const remainingMinutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${remainingMinutes}m`;
    }
};

const formatFileSize = (bytes) => {
    if (bytes < 1024) {
        return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
};

const calculateSpeed = (loadedBytes, elapsedTimeMs) => {
    if (elapsedTimeMs === 0) return 0;
    const bytesPerSecond = (loadedBytes / elapsedTimeMs) * 1000;
    return bytesPerSecond;
};

const DownloadModal = ({ open, onClose, files, folders, dataroomId }) => {
    const { setAlert } = useAlert();
    const [isDownloading, setIsDownloading] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [downloadSpeed, setDownloadSpeed] = useState(0);
    const [downloadStartTime, setDownloadStartTime] = useState(null);
    const [loadedBytes, setLoadedBytes] = useState(0);
    const [totalBytes, setTotalBytes] = useState(0);
    const cancelTokenRef = useRef(null);

    // Effect to reset state when modal opens
    useEffect(() => {
        if (open) {
            setIsDownloading(false);
            setCurrentItem(null);
            setDownloadProgress(0);
            setStatusMessage("");
            setTimeRemaining(null);
            setDownloadSpeed(0);
            setDownloadStartTime(null);
            setLoadedBytes(0);
            setTotalBytes(0);
        }
    }, [open]);

    // Helper to update download status with detailed information
    const updateDownloadStatus = (progressEvent, totalSize = null) => {
        const now = Date.now();
        const loaded = progressEvent.loaded || 0;
        setLoadedBytes(loaded);

        // Update total size if available from response
        const total = progressEvent.total || totalSize;
        if (total) {
            setTotalBytes(total);
        }

        if (total) {
            const percentCompleted = Math.round((loaded * 100) / total);
            setDownloadProgress(percentCompleted);

            // Update status message based on progress
            if (percentCompleted < 25) {
                setStatusMessage("Creating archive...");
            } else if (percentCompleted < 75) {
                setStatusMessage("Downloading content...");
            } else {
                setStatusMessage("Finalizing...");
            }

            // Calculate speed and time remaining
            if (downloadStartTime) {
                const elapsedMs = now - downloadStartTime;
                const bytesPerSecond = calculateSpeed(loaded, elapsedMs);
                setDownloadSpeed(bytesPerSecond);

                if (bytesPerSecond > 0) {
                    const remainingBytes = total - loaded;
                    const remainingSeconds = remainingBytes / bytesPerSecond;
                    setTimeRemaining(remainingSeconds);
                }
            }
        } else {
            // If we can't determine progress, show indeterminate
            setDownloadProgress(null);

            // Still try to calculate speed
            if (downloadStartTime) {
                const elapsedMs = now - downloadStartTime;
                const bytesPerSecond = calculateSpeed(loaded, elapsedMs);
                setDownloadSpeed(bytesPerSecond);
            }
        }
    };

    // Handle download cancellation
    const handleCancelDownload = () => {
        if (cancelTokenRef.current) {
            cancelTokenRef.current.cancel("Download cancelled by user");
            setAlert("Download cancelled", "info");
            setIsDownloading(false);
            setCurrentItem(null);
            setDownloadProgress(0);
            setStatusMessage("");
        }
    };

    // Download a single file
    const downloadSingleFile = async (file) => {
        try {
            setCurrentItem(file);
            setStatusMessage("Preparing download...");
            setDownloadProgress(0);
            setDownloadStartTime(Date.now());

            // Create a new cancel token
            cancelTokenRef.current = axios.CancelToken.source();

            const response = await axios({
                method: "post",
                url: `${process.env.BACKEND_URI}/datarooms/${dataroomId}/singleFile/${file._id}/download`,
                responseType: "blob",
                withCredentials: true,
                timeout: 300000, // 5 minutes
                cancelToken: cancelTokenRef.current.token,
                onDownloadProgress: (progressEvent) => {
                    updateDownloadStatus(progressEvent, file.size);
                },
            });

            await processDownloadResponse(response, file.name);
            return true;
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log("Download cancelled:", error.message);
                return false;
            }
            handleDownloadError(error);
        }
    };

    // Unified download function for multiple files or folders
    const downloadContent = async (files, folders) => {
        try {
            setCurrentItem({ name: "Preparing download..." });
            setStatusMessage("Initializing...");
            setDownloadProgress(0);
            setDownloadStartTime(Date.now());

            // Create a new cancel token
            cancelTokenRef.current = axios.CancelToken.source();

            const fileIds = files.map((file) => file._id);
            const folderIds = folders.map((folder) => folder._id);

            // Calculate estimated total size
            const totalEstimatedSize =
                files.reduce((sum, file) => sum + (file.size || 0), 0) *
                (folders.length > 0 ? 1.5 : 1.2); // Higher overhead with folders

            setTotalBytes(totalEstimatedSize);

            // Determine appropriate endpoint based on content
            let url;
            let data;

            if (files.length === 1 && folders.length === 0) {
                url = `${process.env.BACKEND_URI}/datarooms/${dataroomId}/singleFile/${files[0]._id}/download`;
                data = {};
            } else {
                url = `${process.env.BACKEND_URI}/datarooms/${dataroomId}/download`;
                data = { fileIds, folderIds };
            }

            const response = await axios({
                method: "post",
                url: url,
                data: data,
                responseType: "blob",
                withCredentials: true,
                timeout: 600000, // 10 minutes for large downloads
                cancelToken: cancelTokenRef.current.token,
                onDownloadProgress: (progressEvent) => {
                    updateDownloadStatus(progressEvent, totalEstimatedSize);
                },
            });

            // Generate appropriate filename
            let filename;
            if (files.length === 1 && folders.length === 0) {
                filename = files[0].name;
            } else if (folders.length === 1 && files.length === 0) {
                filename = `${folders[0].name}.zip`;
            } else {
                filename = `dataroom_content.zip`;
            }

            await processDownloadResponse(response, filename);
            return true;
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log("Download cancelled:", error.message);
                return false;
            }
            handleDownloadError(error);
        }
    };

    // Helper function to process download response
    const processDownloadResponse = async (response, filename) => {
        // Validate response
        if (!response.data) {
            throw new Error("Empty response received");
        }

        // Check for error response
        const contentType = response.headers["content-type"];
        if (contentType && contentType.includes("application/json")) {
            const reader = new FileReader();
            const textResult = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsText(response.data);
            });
            const errorData = JSON.parse(textResult);
            throw new Error(errorData.error || "Download failed");
        }

        if (response.data.size === 0) {
            throw new Error("Received empty file");
        }

        // Create and trigger download
        const blob = new Blob([response.data], {
            type: contentType || "application/octet-stream",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            link.remove();
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    // Error handling helper
    const handleDownloadError = (error) => {
        console.error("Download error:", error);
        throw new Error(
            error.response?.data?.error || error.message || "Download failed"
        );
    };

    // Main download handler
    const handleDownload = async () => {
        setIsDownloading(true);

        try {
            // Unified download approach
            const success = await downloadContent(files, folders);

            if (success) {
                // Show appropriate success message
                if (files.length === 1 && folders.length === 0) {
                    setAlert(`Downloaded: ${files[0].name}`, "success");
                } else if (folders.length === 1 && files.length === 0) {
                    setAlert(
                        `Folder downloaded: ${folders[0].name}`,
                        "success"
                    );
                } else {
                    setAlert("All items downloaded successfully", "success");
                }

                onClose();
            }
        } catch (error) {
            console.error("Download failed:", error);
            setAlert(error.message || "Failed to process downloads", "error");
        } finally {
            if (cancelTokenRef.current) {
                cancelTokenRef.current = null;
            }
            setIsDownloading(false);
            setCurrentItem(null);
            setDownloadProgress(0);
            setStatusMessage("");
            setTimeRemaining(null);
            setDownloadSpeed(0);
        }
    };

    // Generate appropriate download message
    const getDownloadMessage = () => {
        if (folders.length === 1 && files.length === 0) {
            return `download this folder including all its subfolders? It will be saved as a zip file.`;
        } else if (files.length === 1 && folders.length === 0) {
            return `download this file?`;
        } else {
            return `download all selected content as a single zip file? The zip will contain ${
                folders.length > 0 ? `${folders.length} folder(s)` : ""
            }${folders.length > 0 && files.length > 0 ? " and " : ""}${
                files.length > 0 ? `${files.length} file(s)` : ""
            }.`;
        }
    };

    // Get download status display
    const getDownloadStatus = () => {
        if (files.length === 1 && folders.length === 0) {
            return `Downloading: ${files[0].name}`;
        } else if (folders.length === 1 && files.length === 0) {
            return `Downloading folder: ${folders[0].name}`;
        } else {
            return "Creating dataroom archive";
        }
    };

    // Calculate total size of selected files
    const getTotalFileSize = () => {
        const totalSize = files.reduce(
            (total, file) => total + (file.size || 0),
            0
        );
        return formatFileSize(totalSize);
    };

    return (
        <StyledDialog
            open={open}
            onClose={!isDownloading ? onClose : undefined}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                Download Items
                {!isDownloading && (
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent>
                <List>
                    {/* Display folders first */}
                    {folders.map((folder) => (
                        <ListItem key={`folder-${folder._id}`}>
                            <Box display="flex" alignItems="center" mr={2}>
                                <FolderIcon color="primary" />
                            </Box>
                            <ListItemText
                                primary={folder.name}
                                secondary="Folder"
                            />
                        </ListItem>
                    ))}

                    {/* Then display files */}
                    {files.map((file) => (
                        <ListItem key={`file-${file._id}`}>
                            <Box display="flex" alignItems="center" mr={2}>
                                <InsertDriveFileIcon />
                            </Box>
                            <ListItemText
                                primary={file.name}
                                secondary={`Size: ${formatFileSize(file.size)}`}
                            />
                        </ListItem>
                    ))}
                </List>

                {files.length > 0 && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Total size: {getTotalFileSize()}
                        {folders.length > 0 && (
                            <Tooltip title="Folder sizes cannot be calculated in advance">
                                <InfoIcon
                                    fontSize="small"
                                    sx={{
                                        verticalAlign: "middle",
                                        ml: 0.5,
                                        width: 16,
                                        height: 16,
                                    }}
                                />
                            </Tooltip>
                        )}
                    </Typography>
                )}

                {isDownloading ? (
                    <ProgressContainer elevation={0}>
                        <Typography variant="subtitle1" gutterBottom>
                            {getDownloadStatus()}
                            {statusMessage && ` - ${statusMessage}`}
                        </Typography>

                        <LinearProgress
                            variant={
                                downloadProgress === null
                                    ? "indeterminate"
                                    : "determinate"
                            }
                            value={downloadProgress || 0}
                            sx={{ my: 1, height: 8, borderRadius: 1 }}
                        />

                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mt={1}
                        >
                            <Typography variant="body2" color="text.secondary">
                                {downloadProgress !== null
                                    ? `${downloadProgress}%`
                                    : "Preparing..."}
                            </Typography>

                            <Box textAlign="right">
                                {loadedBytes > 0 && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {formatFileSize(loadedBytes)}
                                        {totalBytes > 0 &&
                                            ` / ${formatFileSize(totalBytes)}`}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            {downloadSpeed > 0 && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Speed: {formatFileSize(downloadSpeed)}/s
                                </Typography>
                            )}

                            {timeRemaining !== null && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Time remaining: {formatTime(timeRemaining)}
                                </Typography>
                            )}

                            <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                onClick={handleCancelDownload}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </ProgressContainer>
                ) : (
                    <Typography sx={{ mt: 2 }}>
                        Are you sure you want to {getDownloadMessage()}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions>
                {!isDownloading && (
                    <>
                        <Button onClick={onClose} color="secondary">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDownload}
                            color="primary"
                            variant="contained"
                        >
                            Download
                        </Button>
                    </>
                )}
            </DialogActions>
        </StyledDialog>
    );
};

DownloadModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    files: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            size: PropTypes.number.isRequired,
            type: PropTypes.string,
            s3Key: PropTypes.string,
        })
    ),
    folders: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            path: PropTypes.string.isRequired,
            isFolder: PropTypes.bool,
        })
    ),
    dataroomId: PropTypes.string.isRequired,
};

DownloadModal.defaultProps = {
    files: [],
    folders: [],
};

export default DownloadModal;
