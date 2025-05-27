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
} from "@mui/material";

// import internal modules
import axios from "axios";
import useAlert from "../../hooks/useAlert";
import useUser from "../../hooks/useUser";

// import externam modules
import QRCode from "qrcode";
import { memo, useEffect, useState } from "react";
import CountrySelect from "@components/reusableComponents/CountrySelect";
import { validatePhone } from "@utils/inputValidator";

const OptCodeInput = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        fontWeight: "regular",
        padding: 0,
    },
    "& .MuiInputBase-input.MuiOutlinedInput-input": {
        textAlign: "center",
        padding: "10px 5px",
    },
});

const STATUSES = {
    ERROR: -1,
    SECRET_LOADING: 0,
    LOADED: 1,
    SUBMISSION_LOADING: 2,
    SUBMITTED: 3,
};

function SMSAuthenticatorActivationForm({ onSubmit, onClose }) {
    const [otpCode, setOtpCode] = useState("");
    const { axiosInstance } = useUser();
    const { alertHandler, setAlert } = useAlert();
    const [status, setStatus] = useState(STATUSES.SECRET_LOADING);

    const [phone, setPhone] = useState({
        country: { code: "HK", label: "Hong Kong", phone: "852" },
        number: "",
    });

    const [cooldown, setCooldown] = useState(0);

    const [messages, setMessages] = useState({
        otpCode: { error: false, message: "" },
        phone: { error: false, message: "" },
    });

    const handleOtpCodeChange = (event) => {
        setOtpCode(event.target.value);
    };

    const sendOTP = async () => {
        const phoneCode = phone.country.phone.replace(/[^0-9]/gi, "");
        if (!validatePhone(phoneCode + phone.number)) {
            setMessages((prevState) => ({
                ...prevState,
                phone: { error: true, message: "Invalid phone number" },
            }));
            return;
        }
        try {
            await axiosInstance.post(
                `${process.env.BACKEND_URI}/smsAuthenticator/verificationOtp`,
                {
                    phoneNumber: phone.number,
                    phoneCountry: phone.country,
                }
            );
        } catch (err) {
            // We don't want to show the error message to the user
            // setMessages((prevState) => ({
            //     ...prevState,
            //     phone: {
            //         error: true,
            //         message:
            //             "Failed to send verification code due to cooldown or server error. Please try again later.",
            //     },
            // }));
        }
        setCooldown(60);
        setMessages((prevState) => ({
            ...prevState,
            phone: {
                error: false,
                message: "Verification code has been sent to your phone.",
            },
        }));
    };
    const submitActivation = async (e) => {
        e.preventDefault();
        try {
            if (otpCode.length !== 6) {
                setMessages((prevState) => ({
                    ...prevState,
                    otpCode: {
                        error: true,
                        message: "OTP code must be 6 digits",
                    },
                }));
                return;
            }
            await axiosInstance.put(
                `${process.env.BACKEND_URI}/smsAuthenticator/enable`,
                {
                    otpCode,
                }
            );
            onSubmit();
        } catch (err) {
            setMessages((prevState) => ({
                ...prevState,
                otpCode: {
                    error: true,
                    message: "Invalid OTP code",
                },
            }));
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCooldown((prev) => prev > 0 && prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box display="flex" flexDirection="column">
            <Typography variant="h3" sx={{ m: 2 }}>
                SMS Authenticator Setup
            </Typography>
            <Divider mb={2} />
            <Box px={2}>
                <Typography color="primary" variant="h5" mt={2}>
                    Input your phone number and click send to receive the OTP
                </Typography>

                <Divider sx={{ mb: 1 }} />
                <Stack direction="row" width="100%" spacing={1}>
                    <CountrySelect
                        value={phone.country}
                        onChange={(e, newValue) => {
                            setMessages((prevState) => ({
                                ...prevState,
                                phone: {
                                    error: false,
                                    message: "",
                                },
                            }));
                            setPhone((prevState) => ({
                                ...prevState,
                                country: newValue,
                            }));
                        }}
                    />
                    <TextField
                        required
                        variant="outlined"
                        placeholder="Phone Number"
                        value={phone.number}
                        fullWidth
                        sx={{
                            "&  .MuiFormHelperText-root": {
                                //<--- here
                                color: "primary.main",
                            },
                            "& .MuiFormHelperText-root.Mui-error": {
                                color: "error.main",
                            },
                        }}
                        onChange={(e) => {
                            setMessages((prevState) => ({
                                ...prevState,
                                phone: {
                                    error: false,
                                    message: "",
                                },
                            }));
                            setPhone((prevState) => ({
                                ...prevState,
                                number: e.target.value,
                            }));
                        }}
                        error={messages.phone.error}
                        helperText={messages.phone.message}
                    ></TextField>
                </Stack>
                <Box mt={1} display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        onClick={sendOTP}
                        disabled={cooldown > 0}
                    >
                        {cooldown > 0
                            ? `Resend (${cooldown.toFixed(0)})`
                            : "Send"}
                    </Button>
                </Box>

                <Typography color="primary" variant="h5">
                    Enter the OTP code
                </Typography>

                <Divider sx={{ mb: 1 }} />

                <OptCodeInput
                    required
                    sx={{ my: 1 }}
                    variant="outlined"
                    placeholder="OTP Code"
                    value={otpCode}
                    onChange={handleOtpCodeChange}
                    error={messages.otpCode.error}
                    helperText={messages.otpCode.message}
                ></OptCodeInput>
                <Divider sx={{ mb: 1 }} />
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        color="neutral"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                    <Button variant="contained" onClick={submitActivation}>
                        Activate
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default memo(SMSAuthenticatorActivationForm);
