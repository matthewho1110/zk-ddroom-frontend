// internal modules
import styles from "./ResetPasswordPage.module.scss";

import PropTypes from "prop-types";
import useAlert from "../../hooks/useAlert";
import useUser from "../../hooks/useUser";
import {
    confirmPasswordYupSchema,
    passwordYupSchema,
} from "../../utils/inputValidator";
import ErrorPage from "../reusableComponents/ErrorPage";

// external modules
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import * as Yup from "yup";

// mui components
import styled from "@emotion/styled";
import { Button, CircularProgress, TextField, Typography } from "@mui/material";
import axios from "axios";

const ResetPasswordInput = styled(TextField)({
    "& .MuiInputBase-input": {
        padding: "1rem",
    },
});

const STATUSES = {
    SYSTEM_ERROR: -2,
    INVALID_CODE: -1,
    ENTERING: 0,
};

const resetPasswordSchema = Yup.object().shape({
    password: passwordYupSchema,
    confirmPassword: confirmPasswordYupSchema,
});

function ResetPasswordPage({ resetPasswordCode }) {
    const [status, setStatus] = useState(STATUSES.ENTERING);
    const { setAlert } = useAlert();
    const { axiosInstance } = useUser();
    const router = useRouter();
    const [email, setEmail] = useState("");

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const body = {
                    resetPasswordCode: resetPasswordCode,
                };
                const option = {
                    headers: {
                        "Content-Type": "application/json",
                    },
                };
                const email = (
                    await axios.post(
                        `${process.env.BACKEND_URI}/password/reset/details`,
                        body,
                        option
                    )
                ).data.email;
                setEmail(email);
            } catch (err) {
                if (
                    err.response?.status === 400 ||
                    err.response?.status === 404
                ) {
                    setStatus(STATUSES.INVALID_CODE);
                } else {
                    setStatus(STATUSES.SYSTEM_ERROR);
                }
            }
        };

        if (resetPasswordCode) {
            fetchDetails();
        }
    }, [resetPasswordCode]);

    const handleSubmit = async (values) => {
        try {
            const body = {
                resetPasswordCode: resetPasswordCode,
                newPassword: values.password,
            };

            const option = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            await axios.put(
                `${process.env.BACKEND_URI}/password/reset`,
                body,
                option
            );
            setAlert("Password reset successfully", "success");
            router.push("/login");
        } catch (err) {
            if (err.response?.status === 400) {
                setAlert("Invalid Password", "warning");
            } else if (err.response?.status === 404) {
                // The code is expired or invalid
                setStatus(STATUSES.INVALID_CODE);
            } else {
                // System Error
                setStatus(STATUSES.SYSTEM_ERROR);
            }
        }
    };

    return (
        <>
            {status === STATUSES.ENTERING && (
                <div className={styles.container}>
                    <Typography variant="h1" color="primary" sx={{ mb: 2 }}>
                        Reset Password
                    </Typography>

                    <Formik
                        onSubmit={handleSubmit}
                        initialValues={{ email }}
                        validationSchema={resetPasswordSchema}
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
                                <ResetPasswordInput
                                    fullWidth
                                    variant="outlined"
                                    label="Email"
                                    name="email"
                                    value={email}
                                    required
                                    sx={{ mb: 2 }}
                                    disabled
                                />
                                <ResetPasswordInput
                                    fullWidth
                                    variant="outlined"
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={
                                        touched.password > 0 && errors.password
                                    }
                                    helperText={
                                        touched.password && errors.password
                                    }
                                    required
                                    sx={{ mb: 2 }}
                                />
                                <ResetPasswordInput
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
                                    sx={{ mb: 1, py: 1.5 }}
                                >
                                    {isSubmitting ? (
                                        <CircularProgress
                                            size={18}
                                            color="secondary"
                                        />
                                    ) : (
                                        <Typography variant="body1">
                                            Reset Password
                                        </Typography>
                                    )}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </div>
            )}
            {status === STATUSES.INVALID_CODE && (
                <ErrorPage message={"Invalid or Expired Reset Password Code"} />
            )}
            {status === STATUSES.SYSTEM_ERROR && (
                <ErrorPage
                    message={"Something went wrong. Please try again later."}
                />
            )}
        </>
    );
}

ResetPasswordPage.propTypes = {
    resetPasswordCode: PropTypes.string.isRequired,
};

export default ResetPasswordPage;
