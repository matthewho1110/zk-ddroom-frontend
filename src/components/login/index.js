// internal modules
import useAlert from "../../hooks/useAlert";
import useUser from "../../hooks/useUser";
import ForgetPasswordForm from "./ForgetPasswordForm";
import CreateAccountForm from "./CreateAccountForm";
import LoginForm from "./LoginForm";
import styles from "./LoginPage.module.scss";
import TwoFactorAuth from "./TwoFactorAuth";
import lange from "@i18n";
import LangaugeSelect from "@components/LangaugeSelect";

// external modules
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

// mui components
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import axios from "axios";
import { STEPS } from "./models/common";

const INITIAL_LOGIN_CREDENTIALS = {
    email: "",
    password: "",
};

function Login() {
    const router = useRouter();
    const { setAlert, alertHandler } = useAlert();
    const { login, rememberMe, changeRememberMe } = useUser();
    // Basic login credentials
    const [loginCredentials, setLoginCredentials] = useState(
        INITIAL_LOGIN_CREDENTIALS
    );
    // Store the user id for 2FA
    const [uid, setUid] = useState(null);
    // Indicate which two factor authenticators have been enabled
    const [authenticators, setAuthenticators] = useState([]);
    // OTP for two factor authentication
    const [otp, setOtp] = useState(null);
    // Indicate which step the user is in
    const [step, setStep] = useState(STEPS.LOGIN);
    // Indicate whether it being submitted
    const [submitting, setSubmitting] = useState(false);
    const [reloadStatus, setReload] = useState(false);

    const handleOtpChange = (e) => {
        setOtp({
            [e.target.name]: e.target.value,
        });
    };

    const handleLoginCredentialChange = (e) => {
        setLoginCredentials((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const result = await axios.post(
                process.env.BACKEND_URI + "/auth",
                {
                    ...loginCredentials,
                    password: loginCredentials.password,
                    ...(step == STEPS.LOGIN ? {} : { otp }),
                    rememberMe: rememberMe,
                },
                { withCredentials: true }
            );

            if (result.status === 200) {
                // Login Success
                login();
                setAlert("You have successfully logged in", "success");
            } else if (result.status === 202) {
                // 2FA Required
                setStep(STEPS.TWO_FACTOR_AUTH);
                setAuthenticators(result.data.enabledAuthenticators);
                setUid(result.data.uid);
            }
            setSubmitting(false);
        } catch (err) {
            console.log(err);
            alertHandler(err, {
                400: {
                    text: "Missing Email or Password",
                },
                401: {
                    text: "Invalid Email or Password",
                },
                403: {
                    text: "Account Not Verified",
                },
                404: {
                    text: "Invalid Email or Password",
                },
                409: {
                    text: "Missing or Invalid OTP(s). Please try again",
                },
            });
            setSubmitting(false);
        }
    };

    /** Callbacks */
    const handleLoginCredentialChangeCallback = useCallback((e) => {
        handleLoginCredentialChange(e);
    }, []);

    const handleOtpChangeCallback = useCallback((e) => {
        handleOtpChange(e);
    }, []);

    useEffect(() => {
        // console.log(process.env.BACKEND_URI);
    });

    const languageReload = () => {
        setReload(!reloadStatus);
    };

    return (
        <Box className={styles.container}>
            <img src="/images/login/bg1.svg" className={styles.back1}></img>
            <img src="/images/login/bg2.svg" className={styles.back2}></img>
            <img
                src="/images/logo.png"
                width="165px"
                className={styles.logo}
            ></img>
            <div className={styles.select}>
                <LangaugeSelect reloadCB={languageReload} />
            </div>

            <Box className={styles.loginArea}>
                {step === STEPS.LOGIN && (
                    <LoginForm
                        credentials={loginCredentials}
                        onCredentialChange={handleLoginCredentialChangeCallback}
                        onSubmit={handleLogin}
                    />
                )}
                {
                    // 2FA
                    step === STEPS.TWO_FACTOR_AUTH && (
                        <TwoFactorAuth
                            authenticators={authenticators}
                            uid={uid}
                            setStep={setStep}
                            otp={otp}
                            onOtpChange={handleOtpChangeCallback}
                            onOtpSubmit={handleLogin}
                        />
                    )
                }
                {
                    // Forget Password
                    step === STEPS.FORGET_PASSWORD && <ForgetPasswordForm />
                }

                {
                    // Create Account
                    step == STEPS.CREATE_ACCOUNT && <CreateAccountForm />
                }

                {step == STEPS.LOGIN && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <FormControlLabel
                            label={
                                <Typography
                                    color="neutral.dark"
                                    variant="body1"
                                >
                                    {lange("Remember_Me")}
                                </Typography>
                            }
                            control={
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={(e) => {
                                        changeRememberMe(e.target.checked);
                                    }}
                                />
                            }
                        />
                        <Typography
                            className="link-btn"
                            color="primary"
                            onClick={() => {
                                setStep(STEPS.FORGET_PASSWORD);
                            }}
                            variant="body1"
                        >
                            {lange("Forget_Password")}
                        </Typography>
                    </Box>
                )}

                {step == STEPS.LOGIN && (
                    <Button
                        onClick={handleLogin}
                        color="primary"
                        variant="contained"
                        fullWidth
                        sx={{ mb: 1 }}
                    >
                        {submitting ? (
                            <CircularProgress size={20} color="secondary" />
                        ) : (
                            <Typography>{lange("Login")}</Typography>
                        )}
                    </Button>
                )}

                {[STEPS.FORGET_PASSWORD, STEPS.CREATE_ACCOUNT].includes(
                    step
                ) && (
                    <Button
                        variant="contained"
                        color="neutral"
                        fullWidth
                        onClick={() => {
                            setStep(STEPS.LOGIN);
                        }}
                    >
                        {lange("Back")}
                    </Button>
                )}

                {
                    // Register Button
                    step === STEPS.LOGIN && (
                        <Box display="flex" flexDirection="row" mt={2}>
                            <Typography color="neutral.dark" variant="body1">
                                {lange("Login_Tips")}
                            </Typography>
                            &nbsp;
                            <Typography
                                onClick={() => setStep(STEPS.CREATE_ACCOUNT)}
                                className="link-btn"
                                variant="body1"
                            >
                                {lange("Login_Tips_Link")}
                            </Typography>
                        </Box>
                    )
                }
            </Box>
        </Box>
    );
}

export default Login;
