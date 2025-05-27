// @ts-nocheck
// internal modules
import styles from "./RegistrationPage.module.scss";

import useAlert from "../../hooks/useAlert";
import ErrorPage from "../reusableComponents/ErrorPage";
import {
    firstnameYupSchema,
    lastnameYupSchema,
    titleYupSchema,
    organizationYupSchema,
    phoneYupSchema,
    passwordYupSchema,
    confirmPasswordYupSchema,
    emailYupSchema,
} from "../../utils/inputValidator";

// external modules
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import * as yup from "yup";

// mui components
import styled from "@emotion/styled";
import {
    Button,
    TextField,
    Typography,
    Box,
    CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useForm } from "react-hook-form";
import DDRoomTextField from "../DDRoomForm/DDRoomTextField";
import { MenuItem } from "@mui/material";

const RegistrationInput = styled(TextField)({
    "& .MuiInputBase-input": {
        padding: "1rem",
    },
    marginBottom: "0.5rem",
});

const STATUSES = {
    REGISTERED_ERROR: -3,
    SYSTEM_ERROR: -2,
    INVALID_CODE: -1,
    LOADING: 0,
    LOADED: 1,
};

const INITIAL_REGISTRATION_DETAILS = {
    email: "",
    firstname: "",
    lastname: "",
    organization: "",
    title: "",
    phone: "",
    firstSecurityQuestion: "",
    firstSecurityAnswer: "",
    secondSecurityQuestion: "",
    secondSecurityAnswer: "",
    password: "",
    confirmPassword: "",
};

const registerSchema = yup.object().shape({
    email: emailYupSchema,
    firstname: firstnameYupSchema,
    lastname: lastnameYupSchema,
    organization: organizationYupSchema,
    title: titleYupSchema,
    phone: phoneYupSchema,
    password: passwordYupSchema,
    firstSecurityAnswer: yup
        .string()
        .max(50, "Security answer cannot be longer than 50 words"),
    secondSecurityAnswer: yup
        .string()
        .max(50, "Security answer cannot be longer than 50 words"),
    confirmPassword: confirmPasswordYupSchema,
});

const QUESTION_MAP = [
    "What was the name of the boy or the girl you first kissed?",
    "In what city did you meet your spouse/significant other?",
    "What is the middle name of your youngest child?",
    "What was the first exam you failed?",
    "What was your first car?",
    "What is the name of the town where you were born?",
];

type RegisterSchema = yup.InferType<typeof registerSchema>;

type RegistrationPageProps = { registrationCode: string };

function RegistrationPage({ registrationCode }: RegistrationPageProps) {
    const router = useRouter();
    const { control, handleSubmit, setValue, getValues } =
        useForm<RegisterSchema>({
            mode: "all",
            resolver: yupResolver(registerSchema),
            defaultValues: INITIAL_REGISTRATION_DETAILS,
        });

    const [status, setStatus] = useState(STATUSES.LOADING);
    const { setAlert } = useAlert();

    const onSubmit = handleSubmit((formData) => {
        const {
            firstSecurityQuestion,
            firstSecurityAnswer,
            secondSecurityQuestion,
            secondSecurityAnswer,
            ...submitBody
        } = formData;

        const body = {
            ...submitBody,
            securityQuestions: [
                {
                    question: firstSecurityQuestion,
                    answer: firstSecurityAnswer,
                },
                {
                    question: secondSecurityQuestion,
                    answer: secondSecurityAnswer,
                },
            ],
            registrationCode,
        };

        const option = {
            headers: {
                "Content-Type": "application/json",
            },
        };

        axios
            .post(process.env.BACKEND_URI + "/register", body, option)
            .then((response) => {
                setAlert(
                    "Registration successful, please login to continue.",
                    "success"
                );
                router.push("/login");
            })

            .catch((err) => {
                if (err.response) {
                    switch (err.response.status) {
                        case 400:
                            setAlert(
                                "Please fill in all the required fields.",
                                "warning"
                            );
                            break;
                        case 404:
                            setAlert(
                                "Invalid registration code, please check your email.",
                                "warning"
                            );
                            break;
                        default:
                            setAlert(
                                "System Error, please try again later.",
                                "error"
                            );
                            break;
                    }
                    // Request made and server responded with error
                } else if (err.request) {
                    // The request was made but no response was received
                } else {
                    setAlert("System Error, please try again later.", "error");
                }
            });
    });

    useEffect(() => {
        const fetchRegistrationEmail = async () => {
            try {
                setStatus(STATUSES.LOADING);
                const body = {
                    registrationCode: registrationCode,
                };
                const option = {
                    headers: {
                        "Content-Type": "application/json",
                    },
                };
                const response = await axios.post(
                    process.env.BACKEND_URI + "/register/details",
                    body,
                    option
                );
                const email = response.data.email;
                setValue("email", email);
                setStatus(STATUSES.LOADED);
            } catch (err) {
                switch (err.response?.status) {
                    case 400 || 404:
                        setStatus(STATUSES.INVALID_CODE);
                        break;
                    case 405:
                        setStatus(STATUSES.REGISTERED_ERROR);
                        break;
                    default:
                        setStatus(STATUSES.SYSTEM_ERROR);
                        break;
                }
            }
        };
        if (registrationCode) {
            fetchRegistrationEmail();
        }
    }, [registrationCode]);

    if (
        [
            STATUSES.INVALID_CODE,
            STATUSES.SYSTEM_ERROR,
            STATUSES.REGISTERED_ERROR,
        ].includes(status)
    ) {
        return (
            <ErrorPage
                message={
                    status === STATUSES.INVALID_CODE
                        ? "Invalid registration code"
                        : status === STATUSES.REGISTERED_ERROR
                        ? "Account already registered"
                        : "System error"
                }
            />
        );
    } else {
        return (
            <div className={styles.container}>
                <img
                    src="/images/register/bg2.svg"
                    className={styles.back1}
                ></img>

                <div className={styles.registrationArea}>
                    <img src="/images/logo.png" width="300px" />
                    <Typography variant="h3" align="center" sx={{ my: 5 }}>
                        Registration Form
                    </Typography>
                    {status == STATUSES.LOADING && <CircularProgress />}
                    {status != STATUSES.LOADING && (
                        <Box width="100%" onSubmit={onSubmit} component="form">
                            <DDRoomTextField
                                control={control}
                                styledTextField={RegistrationInput}
                                name="email"
                                required
                                fullWidth
                                variant="outlined"
                                disabled
                                id="email-input"
                                label="Email Address"
                                InputLabelProps={{ shrink: true }}
                                sx={{ marginBottom: "1rem" }}
                            />
                            <DDRoomTextField
                                control={control}
                                styledTextField={RegistrationInput}
                                required
                                fullWidth
                                variant="outlined"
                                id="firstname-input"
                                name="firstname"
                                label="First Name"
                                sx={{ marginBottom: "1rem" }}
                            />
                            <DDRoomTextField
                                control={control}
                                styledTextField={RegistrationInput}
                                required
                                fullWidth
                                variant="outlined"
                                id="lastname-input"
                                name="lastname"
                                label="Last Name"
                                sx={{ marginBottom: "1rem" }}
                            />
                            <DDRoomTextField
                                control={control}
                                styledTextField={RegistrationInput}
                                required
                                fullWidth
                                variant="outlined"
                                id="organization-input"
                                name="organization"
                                label="Organization"
                                sx={{ marginBottom: "1rem" }}
                            />
                            <DDRoomTextField
                                control={control}
                                styledTextField={RegistrationInput}
                                required
                                fullWidth
                                variant="outlined"
                                id="password-input"
                                label="Title"
                                name="title"
                                placeholder="e.g. CTO"
                                sx={{ marginBottom: "1rem" }}
                            />
                            <DDRoomTextField
                                control={control}
                                styledTextField={RegistrationInput}
                                variant="outlined"
                                fullWidth
                                id="phone_no-input"
                                label="Phone No."
                                name="phone"
                                sx={{ marginBottom: "1rem" }}
                            />
                            <DDRoomTextField
                                control={control}
                                styledTextField={RegistrationInput}
                                required
                                fullWidth
                                variant="outlined"
                                id="password-input"
                                label="Password"
                                type="password"
                                name="password"
                                sx={{ marginBottom: "1rem" }}
                            />
                            <DDRoomTextField
                                control={control}
                                styledTextField={RegistrationInput}
                                required
                                fullWidth
                                variant="outlined"
                                id="confirm_password_no-input"
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                sx={{ marginBottom: "1rem" }}
                            />
                            <DDRoomTextField
                                select
                                control={control}
                                styledTextField={RegistrationInput}
                                required
                                fullWidth
                                variant="outlined"
                                placeholder="Please select the first security question"
                                id="first-security-question"
                                label={null}
                                name="firstSecurityQuestion"
                                sx={{ marginBottom: "1rem" }}
                            >
                                {QUESTION_MAP.map((res, idx) => {
                                    return (
                                        <MenuItem
                                            disabled={
                                                getValues(
                                                    "secondSecurityQuestion"
                                                ) === res
                                            }
                                            value={res}
                                            key={idx}
                                        >
                                            {res}
                                        </MenuItem>
                                    );
                                })}
                                ;
                            </DDRoomTextField>
                            <DDRoomTextField
                                control={control}
                                styledTextField={RegistrationInput}
                                required
                                fullWidth
                                variant="outlined"
                                id="first-security-answer"
                                label={null}
                                name="firstSecurityAnswer"
                                sx={{ marginBottom: "1rem" }}
                            />
                            <DDRoomTextField
                                select
                                control={control}
                                styledTextField={RegistrationInput}
                                required
                                fullWidth
                                variant="outlined"
                                placeholder="Please select the second security question"
                                id="second-security-question"
                                label={null}
                                name="secondSecurityQuestion"
                                sx={{ marginBottom: "1rem" }}
                            >
                                {QUESTION_MAP.map((res, idx) => {
                                    return (
                                        <MenuItem
                                            disabled={
                                                getValues(
                                                    "firstSecurityQuestion"
                                                ) === res
                                            }
                                            value={res}
                                            key={idx}
                                        >
                                            {res}
                                        </MenuItem>
                                    );
                                })}
                                ;
                            </DDRoomTextField>
                            <DDRoomTextField
                                control={control}
                                styledTextField={RegistrationInput}
                                required
                                fullWidth
                                variant="outlined"
                                id="second-security-answer"
                                label={null}
                                name="secondSecurityAnswer"
                                sx={{ marginBottom: "1rem" }}
                            />
                            <Button
                                sx={{
                                    padding: "0.5rem",
                                }}
                                variant="contained"
                                type="submit"
                                fullWidth
                            >
                                Submit
                            </Button>
                        </Box>
                    )}
                </div>
                <img
                    src="/images/register/bg1.svg"
                    className={styles.back2}
                ></img>
            </div>
        );
    }
}

export default RegistrationPage;
