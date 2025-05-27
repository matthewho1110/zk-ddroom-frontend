import { TextField, Modal, Button, Box, Grid, Typography } from "@mui/material";
import { useState } from "react";
import useUser from "../../../hooks/useUser";
import useAlert from "../../../hooks/useAlert";
import lange from "@i18n";

function RenameFileModal({
    dataroomId,
    open,
    onClose,
    onRenameSuccess,
    fileId,
    fileName,
}) {
    const { logout, axiosInstance } = useUser();
    const { setAlert, alertHandler } = useAlert();
    const [name, setName] = useState(fileName);

    const renameFile = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const updatedFile = await axiosInstance.patch(
                `${process.env.BACKEND_URI}/datarooms/${dataroomId}/files/${fileId}/rename`,
                {
                    name,
                }
            );
            onRenameSuccess(updatedFile.data);
            setAlert("File rename successfully", "success");
            onClose();
        } catch (err) {
            alertHandler(err);
            if (err.response?.status === 401) {
                logout();
            }
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
                onSubmit={renameFile}
            >
                <Typography variant="h3" sx={{ mb: 3 }}>
                    {lange("Rename")} "{fileName}"
                </Typography>
                <TextField
                    fullWidth
                    label={lange("New_Name")}
                    variant="outlined"
                    size="small"
                    name="name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
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
                        {lange("Cancel")}
                    </Button>
                    <Button variant="contained" type="submit" sx={{ ml: 1 }}>
                        {lange("Save")}
                    </Button>
                </Grid>
            </Box>
        </Modal>
    );
}

export default RenameFileModal;
