import { TextField, Modal, Button, Box, Grid, Typography } from "@mui/material";
import { useState } from "react";
import useUser from "../../../hooks/useUser";
import useAlert from "../../../hooks/useAlert";
import lange from "@i18n";

function DeleteFileModal({
    dataroomId,
    open,
    onClose,
    onDeleteSuccess,
    files = [],
    fileName,
}) {
    const [loading, setLoading] = useState(false);
    const { logout, axiosInstance } = useUser();
    const { setAlert, alertHandler } = useAlert();
    const [name, setName] = useState(fileName);

    const deleteFile = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await axiosInstance.delete(
                `datarooms/${dataroomId}/files`,
                {
                    data: {
                        files: files.map((item) => item.id),
                    },
                }
            );
            setAlert("File delete successfully", "success");
            onDeleteSuccess(response.data?.successFiles);
            onClose();
        } catch (err) {
            console.log(err);
            alertHandler(err, {
                404: { text: "File not found", type: "error" },
                403: {
                    text: "You are not permitted to delete this file",
                    type: "error",
                },
            });
        }
    };

    return (
        <Modal open={open}>
            <Box
                margin="10vh auto"
                width="30%"
                p={2}
                borderRadius={2}
                backgroundColor="white"
                display="flex"
                flexDirection="column"
                component="form"
            >
                <Typography variant="h3" sx={{ mb: 3 }}>
                    Are you sure you want to delete "
                    {files.map((item, i) => {
                        return (
                            <span key={i}>
                                {item.name}
                                {files.length > 1 && i !== files.length - 1
                                    ? ", "
                                    : ""}
                            </span>
                        );
                    })}
                    "
                </Typography>

                <Grid
                    container
                    width="100%"
                    alignItems="flex-end"
                    justifyContent="flex-end"
                    marginTop={2}
                    spacing={1}
                >
                    <Button
                        variant="contained"
                        color="neutral"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        type="submit"
                        sx={{ ml: 1 }}
                        onClick={deleteFile}
                    >
                        Ok
                    </Button>
                </Grid>
            </Box>
        </Modal>
    );
}

export default DeleteFileModal;
