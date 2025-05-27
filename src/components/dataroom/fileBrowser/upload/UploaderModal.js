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
                    dataroom?.usedStorage + totalUploadSize >
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

    const onFileUploadComplete = (result) => {
        setUploadState((prevState) => ({
            ...prevState,
            [result]: prevState[result] + 1,
        }));
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
                    width: "80vw",
                    height: "80vh",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                }}
                component="form"
            >
                <Box display="flex" flexDirection="row" sx={{ mb: 2 }}>
                    <Typography variant="h3">File Uploads</Typography>
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
                                {/* <TableCell width="10%">Index</TableCell> */}
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
                            {uploads.map((upload, i) => {
                                return (
                                    <FileUploadRow
                                        visible={true}
                                        dataroomId={dataroomId}
                                        file={upload}
                                        key={i}
                                        // directoryIndex={directoryIndex}
                                        // subIndex={startingSubIndex + i}
                                        depth={0}
                                        onRemove={onFileRemove}
                                        rootUploadStatus={uploadState.status}
                                        signedFiles={uploadState.signedFiles}
                                        onUploadComplete={onFileUploadComplete}
                                    />
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Divider />
                <Stack
                    direction="row"
                    alignItems="flex-end"
                    position="relative"
                    width="100%"
                    p={2}
                    spacing={6}
                    mt={1}
                >
                    {dataroomRole?.showDataroomStorage && (
                        <StorageCard
                            usedStorage={dataroom?.usedStorage}
                            maxStorage={dataroom?.maxStorage}
                            sx={{
                                color: "black",
                                width: "30%",
                                m: 0,
                                p: 0,
                                border: "none",
                            }}
                        />
                    )}
                    {
                        // If we are uploading, show the progress bar
                        [
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
                                    margin: 2,
                                    flexDirection: "column",
                                }}
                            >
                                {uploadState.status == "PREPARING" && (
                                    <Typography variant="h6">
                                        Preparing file upload
                                    </Typography>
                                )}
                                {
                                    uploadState.status == "PENDING" && (
                                        <Typography variant="h6">
                                            Pending uploads{" "}
                                            {formatFileSize(totalUploadSize)}
                                        </Typography>
                                    ) // If we are waiting for the user to start the upload, show the waiting message
                                }
                                {["UPLOADING", "FINISHED"].includes(
                                    uploadState.status
                                ) && (
                                    <Typography variant="h6">
                                        {Math.round(uploadProgress)}% Complete
                                    </Typography>
                                )}

                                {uploadState.status == "ERROR" && (
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {
                                            "Upload Failed. Please check the file names and dataroom storage space."
                                        }
                                    </Typography>
                                )}

                                <Box width="100%">
                                    {
                                        // If we are waiting for the user to start the upload, show the waiting progress bar
                                        uploadState.status == "PENDING" && (
                                            <BorderLinearProgress
                                                variant="determinate"
                                                value={0}
                                            />
                                        )
                                    }
                                    {
                                        // If we are preparing files, show the preparing progress bar
                                        uploadState.status == "PREPARING" && (
                                            <BorderLinearProgress />
                                        )
                                    }
                                    {["UPLOADING", "FINISHED"].includes(
                                        uploadState.status
                                    ) && (
                                        <BorderLinearProgress
                                            variant="determinate"
                                            value={uploadProgress}
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
                        )
                    }
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
