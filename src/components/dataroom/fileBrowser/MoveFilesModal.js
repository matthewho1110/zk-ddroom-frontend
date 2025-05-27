import styled from "@emotion/styled";
import {
    InputAdornment,
    TextField,
    Modal,
    Paper,
    Button,
    Box,
    Typography,
    CircularProgress,
    Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FileList from "./FileList";
import ErrorPage from "../../reusableComponents/ErrorPage";
import useUser from "../../../hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import useAlert from "../../../hooks/useAlert";

import Ancestry from "./Ancestry";

import useConfirmationDialog from "../../../hooks/useConfirmationDialog";
import lange from "@i18n";

const STATUSES = {
    UNAUTHORIZED_ERROR: -2,
    SYSTEM_ERROR: -1,
    LOADING: 0,
    LOADED: 1,
};
function MoveFilesModal({
    filesToMove = [],
    dataroomId,
    open,
    onSubmit,
    onClose,
    oldPath,
}) {
    const [status, setStatus] = useState(STATUSES.LOADING);
    const [filepath, setFilePath] = useState(oldPath);
    const [currentFile, setCurrentFile] = useState(null);
    const { logout, axiosInstance } = useUser();
    const { alertHandler } = useAlert();

    const fileNamesToMove = filesToMove.map((file) => file?.name);
    const fileIdsToMove = filesToMove.map((file) => file?._id);
    const { setConfirmationDialog } = useConfirmationDialog();

    const fetchFile = async (_path) => {
        try {
            const response = await axiosInstance.get(
                `datarooms/${dataroomId}/files?path=${_path}&directory=true`
            );

            setCurrentFile(response.data);
            setStatus(STATUSES.LOADED);
        } catch (err) {
            alertHandler(err);
            if (err.response?.status === 401) {
                logout();
            } else {
                setStatus(STATUSES.SYSTEM_ERROR);
                setCurrentFile(null);
            }
        }
    };
    const handleFileClick = (directory) => {
        setFilePath(directory);
    };

    useEffect(() => {
        if (dataroomId) {
            setStatus(STATUSES.LOADING);
            fetchFile(decodeURIComponent(filepath));
        }
    }, [dataroomId, filepath]);

    if (status === STATUSES.UNAUTHORIZED_ERROR) {
        return <ErrorPage message={lange("File_Move_Error_2")} />;
    } else if (status === STATUSES.SYSTEM_ERROR) {
        return <ErrorPage message={lange("File_Move_Error_1")} />;
    } else {
        return (
            <Modal open={open} onClose={onClose}>
                <Paper
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "80vw",
                        height: "80vh",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        py={3}
                        px={3}
                        position="relative"
                        width="100%"
                        height="100%"
                    >
                        <Box
                            display="flex"
                            flexDirection="row"
                            gap={1}
                            alignItems="center"
                            sx={{ mb: 1 }}
                        >
                            <Typography variant="h6">
                                {lange("Files_To_Move")}:
                            </Typography>
                            <Typography variant="body1">
                                {fileNamesToMove.join(", ")}
                            </Typography>
                        </Box>
                        <Stack direction="row" alignItems="center">
                            <Typography variant="h6">
                                {lange("Old_Directory")}:
                            </Typography>

                            <Ancestry
                                path={oldPath}
                                onAncestorClick={handleFileClick}
                            />
                        </Stack>
                        <Stack direction="row" alignItems="center">
                            <Typography variant="h6">
                                {lange("New_Directory")}:
                            </Typography>
                            <Ancestry
                                path={currentFile?.path}
                                highlightLast={true}
                                onAncestorClick={handleFileClick}
                            />
                        </Stack>

                        <Paper
                            sx={{
                                height: "100%",
                                width: "100%",
                                position: "relative",
                                overflow: "hidden",
                                marginTop: "1.5rem",
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
                                currentFile.type === "folder" && (
                                    <FileList
                                        excludeFiles={fileIdsToMove}
                                        files={currentFile?.files}
                                        onFileClick={handleFileClick}
                                        uploadDisabled={true}
                                        actionDisabled={true}
                                        selectDisabled={true}
                                        permission={
                                            currentFile?.permission?.level
                                        }
                                    />
                                )}
                        </Paper>
                        <Stack direction="row" sx={{ ml: "auto", mt: 2 }}>
                            <Button
                                variant="contained"
                                component="label"
                                onClick={() => {
                                    setConfirmationDialog({
                                        title: "Move Files",
                                        description: (
                                            <div>
                                                {lange("Move_Warning_1")}
                                                <span
                                                    style={{
                                                        color: "var(--main-blue)",
                                                    }}
                                                >
                                                    {fileNamesToMove.join(", ")}
                                                </span>
                                                {lange("Move_Warning_2")}

                                                <span>{oldPath}</span>
                                                {lange("Move_Warning_3")}
                                                <span
                                                    style={{
                                                        color: "var(--main-blue)",
                                                    }}
                                                >
                                                    {filepath}
                                                </span>
                                                {"?"}
                                            </div>
                                        ),
                                        onConfirm: () => onSubmit(filepath),
                                        onCancel: () => {},
                                    });
                                }}
                            >
                                {lange("Move")}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Modal>
        );
    }
}

export default MoveFilesModal;
