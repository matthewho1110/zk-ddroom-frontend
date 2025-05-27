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

const AUTENTICATOR_LIST = [
    "Microsoft Authenticator",
    "Google Authenticator",
    "OneLogin",
    "Authy",
    "LastPass Authenticator",
];

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

function MobileAuthenticatorActivationForm({ onSubmit, onClose }) {
    const [otpCode, setOtpCode] = useState("");
    const [secret, setSecret] = useState({});
    const { axiosInstance } = useUser();
    const { alertHandler, setAlert } = useAlert();
    const [status, setStatus] = useState(STATUSES.SECRET_LOADING);

    const handleOtpCodeChange = (event) => {
        setOtpCode(event.target.value);
    };

    const generateMobileAuthenticatorSecret = async () => {
        try {
            setStatus(STATUSES.SECRET_LOADING);
            const secret = (
                await axiosInstance.post(
                    `${process.env.BACKEND_URI}/mobileAuthenticator/secret`,
                    {}
                )
            )?.data;

            const qrcodeURI = await QRCode.toDataURL(secret.otpauth_url);
            setSecret({ ...secret, qrcodeURI });
            setStatus(STATUSES.LOADED);
        } catch (err) {
            alertHandler(err, {
                500: {
                    type: "error",
                    text: "Failed to generate the 2FA secret. Please try again by clicking the refresh button.",
                },
            });
            setStatus(STATUSES.ERROR);
        }
    };

    const submitActivation = async (e) => {
        e.preventDefault();
        try {
            if (otpCode.length !== 6) {
                setAlert("Invalid OTP code. Please try again.", "error");
            }
            await axiosInstance.put(
                `${process.env.BACKEND_URI}/mobileAuthenticator/enable`,
                {
                    otpCode,
                }
            );
            onSubmit();
        } catch (err) {
            alertHandler(err, {
                400: {
                    type: "error",
                    text: "Invalid OTP code. Please try again.",
                },
            });
        }
    };

    useEffect(() => {
        generateMobileAuthenticatorSecret();
    }, []);

    return (
        <Box
            display="flex"
            flexDirection="column"
            component="form"
            onSubmit={submitActivation}
        >
            <Typography variant="h3" sx={{ m: 2 }}>
                Mobile Authenticator Setup
            </Typography>
            <Divider mb={2} />
            <Box
                px={2}
                sx={{
                    "& ol > li": {
                        mb: 1,
                        typography: "h5",
                    },
                    "& ul > li": {
                        my: 0.5,
                        typography: "h6",
                    },
                }}
            >
                <Typography color="primary" variant="h5" mt={2}>
                    Configuring your desired Authenticator App
                </Typography>
                <Divider />
                <ol>
                    <li>
                        Install one of the following authenticator apps on your
                        phone:
                        <ul>
                            {AUTENTICATOR_LIST.map((authenticator) => (
                                <li key={authenticator}>{authenticator}</li>
                            ))}
                        </ul>
                    </li>
                    <li>In the authenticator app, select "+" icon.</li>
                    <li>
                        Select "Scan a barcode (or QR code)" and use the phone's
                        camera to scan this barcode.
                    </li>
                </ol>
                <Typography color="primary" variant="h5">
                    Scan QR Code
                </Typography>
                <Divider />
                <Stack direction="row" alignItems="end">
                    <img src={secret.qrcodeURI}></img>
                    <IconButton
                        sx={{ my: "auto" }}
                        onClick={() => generateMobileAuthenticatorSecret()}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Stack>

                <Divider sx={{ mb: 1 }} />
                <Typography color="primary" variant="h5" mt={2}>
                    Alernatively, you can manually enter the following key into
                    the the App
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography
                    variant="h6"
                    sx={{
                        userSelect: "auto !important",
                        WebkitUserSelect: "auto !important",
                    }}
                >
                    Secret Key: {secret.base32}
                </Typography>
                <Typography color="primary" variant="h5" mt={2}>
                    Verify 2FA Code
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="h6">
                    Please enter the 2FA Code displayed on your App
                </Typography>
                <OptCodeInput
                    required
                    sx={{ my: 1 }}
                    variant="outlined"
                    placeholder="OTP Code"
                    value={otpCode}
                    onChange={handleOtpCodeChange}
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
                    <Button variant="contained" type="submit">
                        Activate
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default memo(MobileAuthenticatorActivationForm);
