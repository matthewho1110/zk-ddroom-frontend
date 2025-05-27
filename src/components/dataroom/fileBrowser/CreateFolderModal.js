import { TextField, Modal, Button, Box, Grid, Typography } from "@mui/material";
import { useState } from "react";
import useUser from "../../../hooks/useUser";
import useAlert from "../../../hooks/useAlert";
import lange from "@i18n";
import { isMobile } from "react-device-detect";

function CreateFolderModal({
    dataroomId,
    open,
    onClose,
    onCreateSuccess,
    directory,
    index,
}) {
    const { logout, axiosInstance } = useUser();
    const { setAlert, alertHandler } = useAlert();
    const [name, setName] = useState(null);

    const createFolder = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const createdFolder = await axiosInstance.patch(
                `${process.env.BACKEND_URI}/datarooms/${dataroomId}/files/${directory}/upload`,
                {
                    uploads: [
                        {
                            name: name,
                            type: "folder",
                            children: [],
                        },
                    ],
                }
            );
            setAlert("Create folder successfully", "success");
            onCreateSuccess(createdFolder.data);
            onClose();
        } catch (err) {
            setAlert(
                "Create folder failed. This may be due to an existing folder name or index, or network error.",
                "error"
            );
        }
    };

    return (
        <Modal open={open}>
            <Box
                margin="10vh auto"
                width={isMobile ? "80%" : "30%"}
                p={2}
                borderRadius={2}
                backgroundColor="white"
                display="flex"
                flexDirection="column"
                component="form"
                onSubmit={createFolder}
            >
                <Typography variant="h3" sx={{ mb: 3 }}>
                    {lange("New_Folder")}
                </Typography>
                <TextField
                    fullWidth
                    label={lange("Folder_Index")}
                    variant="standard"
                    size="small"
                    name="index"
                    required
                    value={index}
                    disabled
                    sx={{ mb: 1 }}
                />

                <TextField
                    fullWidth
                    label={lange("Folder_Name")}
                    variant="standard"
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
                        {lange("Create")}
                    </Button>
                </Grid>
            </Box>
        </Modal>
    );
}

export default CreateFolderModal;
