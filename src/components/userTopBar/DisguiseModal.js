// React Hooks
import React, { useState } from "react";
import { useRouter } from "next/router";

// MUI Components
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Box, Alert, Stack, Grid, Modal } from "@mui/material";
import Typography from "@mui/material/Typography";

// Custom Hooks
import useUser from "../../hooks/useUser";
import useAlert from "../../hooks/useAlert";

// Custom Utils
import { validateEmail } from "../../utils/inputValidator";
const DisguiseModal = ({ open, onClose }) => {
    // State Variables
    const [disguise, setDisguise] = useState({
        email: "",
    });
    const [errors, setErrors] = useState({
        email: "",
    });

    // Custom Hooks
    const { axiosInstance } = useUser();
    const { setAlert } = useAlert();
    const router = useRouter();

    const sendDisguiseReq = async () => {
        try {
            const disguiseUser = (
                await axiosInstance.post(`/user/disguise`, disguise)
            ).data.disguiseUser;

            localStorage.setItem("disguiseId", disguiseUser._id);
            window.location = "/datarooms";
            setAlert(
                `Disguise successful. You are now disguising as ${
                    disguiseUser.firstname + " " + disguiseUser.lastname
                }`,
                "success"
            );
        } catch (error) {
            if (error.response?.status === 404) {
                setErrors({ email: "User not found." });
            } else {
                setAlert(
                    "Something went wrong. Please try again later.",
                    "error"
                );
            }
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validateEmail(disguise.email)) {
            setErrors({
                ...errors,
                email: "Please enter a valid email address.",
            });
            return;
        } else {
            sendDisguiseReq();
        }
    };

    const handleChange = (event) => {
        setDisguise({
            ...disguise,
            [event.target.name]: event.target.value,
        });
        setErrors({ email: "", question: "", category: "" });
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
            >
                <Typography component="h1" variant="h5">
                    Disguise
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="email"
                        name="email"
                        autoComplete="email"
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                        value={disguise.email}
                        onChange={handleChange}
                        autoFocus
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
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            sx={{ ml: 1 }}
                        >
                            Confirm
                        </Button>
                    </Grid>
                </Box>
            </Box>
        </Modal>
    );
};

export default DisguiseModal;
