// MUI modules
import styled from "@emotion/styled";
import {
    TextField,
    Modal,
    Paper,
    Typography,
    TableBody,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    Button,
    Stack,
    Box,
    Divider,
} from "@mui/material";

import LinearProgress, {
    linearProgressClasses,
} from "@mui/material/LinearProgress";

// react hooks
import { useState, useEffect } from "react";

// custom hooks
import useUser from "../../../../hooks/useUser";
import useAlert from "../../../../hooks/useAlert";

// custom components
import FileUploadRow from "./FileUploadRow";
import lange from "@i18n";

import useSWR from "swr";
import { bytesToGb, formatFileSize } from "../../../../utils/fileHelper";
import StorageCard from "../../../reusableComponents/dataroom/StorageCard";

// Custom config
import { ROLES } from "../../../../configs/roleConfig";

const FileFilter = styled(TextField)({
    width: "100%",
    "& .MuiInputBase-root.MuiOutlinedInput-root": {
        padding: "6px 16px",
        height: "100%",
    },
    "& .MuiInputBase-input.MuiOutlinedInput-input": {
        lineHeight: 1.75,
        padding: 0,
    },
    "& .MuiInput-input.MuiInputBase-input.Mui-disabled": {
        "-webkit-text-fill-color": "rgb(0, 0, 0)", // (default alpha is 0.38)
    },
});

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
}));

function UploaderModal({
    dataroomId,
    currentFileId,
    existingFileNames,
    open,
    onClose,
    // directoryIndex,
    // startingSubIndex,
    uploads,
    onFileRemove,
}) {
    const { axiosInstance } = useUser();
    const { setAlert } = useAlert();
    // state variables
    const [uploadState, setUploadState] = useState({
        status: "PENDING",
        success: 0,
        partialSuccess: 0,
        failed: 0,
        signedFiles: {},
    });

    const totalUploadSize = uploads.reduce((acc, curr) => acc + curr.size, 0);

    // Get dataroom data
    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const { data: dataroomData, mutate: mutateDataroomData } = useSWR(
        dataroomId ? `/datarooms/${dataroomId}` : null,
        fetcher
    );

    const { data: usedStorage } = useSWR(
        dataroomId ? `/datarooms/${dataroomId}/size` : null,
        fetcher
    );

    // Get user role of the dataroom
    const dataroomRole = ROLES[dataroomData?.role];
    const dataroom = dataroomData?.dataroom;

    const prepareUploads = async () => {
        try {
            // Check if uploads contain any existing files
            const uploadFileNames = uploads.map((upload) => upload.name);
            const duplicateFilenames = uploadFileNames.filter((name) =>
                existingFileNames.includes(name)
            );
            if (duplicateFilenames.length > 0) {
                setAlert(
                    `Below files already exist in the dataroom: ${duplicateFilenames.join(
                        ", "
                    )}`,
                    "warning"
                );
                return;
            }
            // Check if the total upload size exceeds the dataroom storage limit
            if (dataroom?.maxStorage != -1) {
                if (
                    usedStorage?.size + totalUploadSize >
                    dataroom?.maxStorage
                ) {
                    setAlert(
                        "Upload size exceeds dataroom storage limit",
                        "warning"
                    );
                    return;
                }
            }
            setUploadState((prevState) => ({
                ...prevState,
                status: "PREPARING",
            }));
            const response = await axiosInstance.patch(
                `datarooms/${dataroomId}/files/${currentFileId}/upload`,
                {
                    uploads: uploads,
                }
            );
            setUploadState((prevState) => ({
                ...prevState,
                status: "UPLOADING",
                signedFiles: response.data,
            }));
        } catch (err) {
            console.log(err);
            setUploadState((prevState) => ({
                ...prevState,
                status: "ERROR",
            }));
        }
    };

    const getUploadProgress = () => {
        const total = uploads.length;
        const completed =
            uploadState.success +
            uploadState.partialSuccess +
            uploadState.failed;
        return (completed / total) * 100;
    };

    const uploadProgress = getUploadProgress();
    const [singleUploadProgress, setSingleUploadProgress] = useState(0);
    const onFileUploadComplete = (result) => {
        setUploadState((prevState) => ({
            ...prevState,
            [result]: prevState[result] + 1,
        }));
    };

    const handleUploadProgress = (percentage) => {
        setSingleUploadProgress(percentage);
    };

    useEffect(() => {
        if (uploadState.status == "UPLOADING" && uploadProgress == 100) {
            setUploadState((prevState) => ({
                ...prevState,
                status: "FINISHED",
            }));
            mutateDataroomData();
            setAlert("Upload complete", "success");
        }
    }, [uploadState]);

    return (
        <Modal open={open}>
            <Paper
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: "90vw", sm: "80vw", md: "70vw" },
                    height: { xs: "90vh", sm: "80vh", md: "70vh" },
                    padding: { xs: "8px", sm: "16px" },
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
                component="form"
            >
                <Box display="flex" flexDirection="row" sx={{ mb: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
                    >
                        File Uploads
                    </Typography>
                </Box>

                <TableContainer
                    sx={{
                        height: "100%",
                        width: "100%",
                        overflow: "auto",
                        position: "relative",
                    }}
                >
                    <Table
                        sx={{
                            minWidth: 650,
                            overflow: "auto",
                            position: "relative",
                            tableLayout: "fixed",
                        }}
                        aria-label="simple table"
                        stickyHeader
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell width="60%">
                                    {lange("File_Name")}
                                </TableCell>
                                <TableCell width="30%" align="left">
                                    {lange("Size")}
                                </TableCell>
                                <TableCell width="10%" align="left">
                                    {lange("Status")}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody
                            sx={{
                                "& .MuiTableCell-root": {
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                },
                            }}
                        >
                            {uploads.map((upload, i) => (
                                <FileUploadRow
                                    visible={true}
                                    dataroomId={dataroomId}
                                    file={upload}
                                    key={i}
                                    uploadProgress={handleUploadProgress}
                                    depth={0}
                                    onRemove={onFileRemove}
                                    rootUploadStatus={uploadState.status}
                                    signedFiles={uploadState.signedFiles}
                                    onUploadComplete={onFileUploadComplete}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Divider />
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems="flex-end"
                    position="relative"
                    width="100%"
                    p={2}
                    spacing={2}
                    mt={1}
                >
                    {dataroomRole?.showDataroomStorage && (
                        <StorageCard
                            usedStorage={usedStorage?.size}
                            maxStorage={dataroom?.maxStorage}
                            sx={{
                                color: "black",
                                width: { xs: "100%", sm: "30%" },
                                m: 0,
                                p: 0,
                                border: "none",
                            }}
                        />
                    )}

                    {[
                        "UPLOADING",
                        "FINISHED",
                        "PREPARING",
                        "PENDING",
                        "ERROR",
                    ].includes(uploadState.status) && (
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                margin: { xs: 1, sm: 2 },
                                flexDirection: "column",
                            }}
                        >
                            {uploadState.status == "PREPARING" && (
                                <Typography variant="h6">
                                    Preparing file upload
                                </Typography>
                            )}
                            {uploadState.status == "PENDING" && (
                                <Typography variant="h6">
                                    Pending uploads{" "}
                                    {formatFileSize(totalUploadSize)}
                                </Typography>
                            )}
                            {["UPLOADING", "FINISHED"].includes(
                                uploadState.status
                            ) && (
                                <Typography variant="h6">
                                    {uploads.length == 1
                                        ? singleUploadProgress
                                        : Math.round(uploadProgress)}
                                    % Complete
                                </Typography>
                            )}
                            {uploadState.status == "ERROR" && (
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    Upload Failed. Please check the file names
                                    and dataroom storage space.
                                </Typography>
                            )}
                            <Box width="100%">
                                {uploadState.status == "PENDING" && (
                                    <BorderLinearProgress
                                        variant="determinate"
                                        value={0}
                                    />
                                )}
                                {uploadState.status == "PREPARING" && (
                                    <BorderLinearProgress />
                                )}
                                {["UPLOADING", "FINISHED"].includes(
                                    uploadState.status
                                ) && (
                                    <BorderLinearProgress
                                        variant="determinate"
                                        value={
                                            uploads.length == 1
                                                ? singleUploadProgress
                                                : uploadProgress
                                        }
                                    />
                                )}
                                {uploadState.status == "ERROR" && (
                                    <BorderLinearProgress
                                        variant="determinate"
                                        value={100}
                                        color="error"
                                    />
                                )}
                            </Box>
                        </Box>
                    )}
                    <Stack direction="row" spacing={2}>
                        {["PENDING", "ERROR", "FINISHED"].includes(
                            uploadState.status
                        ) && (
                            <Button
                                onClick={() => onClose()}
                                variant="contained"
                                color="neutral"
                            >
                                <Typography variant="body1">
                                    {uploadState.status == "PENDING"
                                        ? lange("Cancel")
                                        : lange("OK")}
                                </Typography>
                            </Button>
                        )}

                        {uploadState.status == "PENDING" && (
                            <Button
                                onClick={prepareUploads}
                                variant="contained"
                            >
                                <Typography variant="body1">
                                    {lange("Upload")}
                                </Typography>
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Paper>
        </Modal>
    );
}

export default UploaderModal;
