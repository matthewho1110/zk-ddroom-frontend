// import MUI modules
import styled from "@emotion/styled";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
    Box,
    Button,
    Divider,
    IconButton,
    Stack,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";

// import internal modules
import styles from "./ChangePasswordForm.module.scss";
import axios from "axios";
import useAlert from "../../hooks/useAlert";
import useUser from "../../hooks/useUser";
import {
    PASSWORD_REQUIREMENTS,
    confirmPasswordYupSchema,
    passwordYupSchema,
} from "../../utils/inputValidator";

// import external modules
import QRCode from "qrcode";
import { memo, useEffect, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

const PasswordInput = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        fontWeight: "regular",
        padding: 0,
    },
});

const changePasswordSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Required"),
    password: passwordYupSchema,
    confirmPassword: confirmPasswordYupSchema,
});

const ChangePasswordForm = ({ onSubmit, onClose }) => {
    const { setAlert, alertHandler } = useAlert();
    const { axiosInstance } = useUser();
    const handleSubmit = async (values) => {
        try {
            await axiosInstance.put(`${process.env.BACKEND_URI}/password`, {
                oldPassword: values.oldPassword,
                newPassword: values.password,
            });
            setAlert("Password changed successfully", "success");
            onSubmit();
        } catch (err) {
            alertHandler(err, {
                400: {
                    text: "Invalid passwords",
                },
                403: {
                    text: "Incorrect old password",
                },
            });
        }
    };
    return (
        <Box
            display="flex"
            flexDirection="column"
            m="auto"
            overflow="auto"
            p={3}
            backgroundColor="white"
            borderRadius={2}
        >
            <Typography variant="h3" sx={{ mb: 2 }}>
                Change Password
            </Typography>
            <Typography color="primary" variant="h5">
                Password Requirements
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {PASSWORD_REQUIREMENTS.map((requirement) => {
                return (
                    <Typography
                        as="li"
                        variant="body1"
                        color="text.secondary"
                        key={requirement}
                    >
                        {requirement}
                    </Typography>
                );
            })}
            <Divider sx={{ mt: 2, mb: 2 }} />
            <Formik
                onSubmit={handleSubmit}
                validationSchema={changePasswordSchema}
                initialValues={{
                    oldPassword: "",
                    password: "",
                    confirmPassword: "",
                }}
            >
                {({
                    handleSubmit,
                    values,
                    handleChange,
                    handleBlur,
                    isSubmitting,
                    touched,
                    errors,
                }) => (
                    <Form
                        // eslint-disable-next-line react/prop-types
                        onSubmit={handleSubmit}
                        className={styles.form}
                    >
                        <PasswordInput
                            fullWidth
                            variant="outlined"
                            label="Old Password"
                            name="oldPassword"
                            type="password"
                            value={values.oldPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                                touched.oldPassword > 0 && errors.oldPassword
                            }
                            helperText={
                                touched.oldPassword && errors.oldPassword
                            }
                            required
                            sx={{ mb: 2 }}
                        />
                        <PasswordInput
                            fullWidth
                            variant="outlined"
                            label="Password"
                            name="password"
                            type="password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.password > 0 && errors.password}
                            helperText={touched.password && errors.password}
                            required
                            sx={{ mb: 2 }}
                        />
                        <PasswordInput
                            fullWidth
                            variant="outlined"
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                                touched.confirmPassword > 0 &&
                                errors.confirmPassword
                            }
                            helperText={
                                touched.confirmPassword &&
                                errors.confirmPassword
                            }
                            required
                            sx={{ mb: 2 }}
                        />

                        <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                            fullWidth
                            sx={{
                                mb: 1,
                                pointerEvents: isSubmitting ? "none" : "auto",
                            }}
                        >
                            {isSubmitting ? (
                                <CircularProgress size={20} color="secondary" />
                            ) : (
                                <Typography>Change Password</Typography>
                            )}
                        </Button>
                        <Button
                            color="neutral"
                            variant="contained"
                            fullWidth
                            disabled={isSubmitting}
                            onClick={onClose}
                        >
                            <Typography
                                variant="body1"
                                color="white"
                                sx={{ cursor: "pointer" }}
                            >
                                Cancel
                            </Typography>
                        </Button>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};
export default ChangePasswordForm;
