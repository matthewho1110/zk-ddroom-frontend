// import external modules
import axios from "axios";
import { memo, useState } from "react";

// import MUI modules
import styled from "@emotion/styled";
import SendIcon from "@mui/icons-material/Send";
import {
    Box,
    CircularProgress,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material";

// import internal modules
import useAlert from "../../hooks/useAlert";
import useUser from "../../hooks/useUser";
import { validateEmail } from "../../utils/inputValidator";
import lange from "@i18n";

// statuses
const STATUSES = {
    IDLE: 0,
    SUBMITTING: 1,
};

const EmailInput = styled(TextField)({
    "& label.Mui-focused": {
        color: "#191919",
    },

    "& .MuiOutlinedInput-root": {
        color: "#002961",
        fontWeight: "regular",
        padding: "0.5rem",
    },

    "& .MuiInputBase-input": {
        padding: "0rem",
    },

    "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: "1px",
        borderColor: "#002961",
    },

    "& legend": { display: "none" },
    "& fieldset": { top: 0 },
});

const ForgetPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(STATUSES.IDLE);
    const { setAlert, alertHandler } = useAlert();
    const { axiosInstance } = useUser();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateEmail(email) == false) {
            setAlert("Invalid email address", "warning");
            return;
        }
        setStatus(STATUSES.SUBMITTING);

        try {
            await axiosInstance.post(
                `${process.env.BACKEND_URI}/password/reset/sendEmail`,
                {
                    email: email,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setAlert(
                "Reset Password email has been sent to your mailbox, please follow the specified instructions.",
                "success"
            );
        } catch (err) {
            alertHandler(err, {
                404: {
                    text: "There is no account associated with this email address.",
                },
            });
        }

        setStatus(STATUSES.IDLE);
    };

    return (
        <Box component="form" width="100%" onSubmit={handleSubmit}>
            <Typography
                variant="h3"
                sx={{ mb: 1, fontWeight: 450 }}
                color="primary"
            >
                {lange("Forget_Password")}
            </Typography>
            <Typography variant="h5" sx={{ mb: 2 }} color="neutral.main">
                {lange("Forget_Tips")}
            </Typography>

            <EmailInput
                value={email}
                fullWidth
                sx={{
                    marginBottom: "1rem",
                }}
                InputLabelProps={{ shrink: false }}
                FormHelperTextProps={{
                    style: {
                        marginTOp: "1rem",
                    },
                }}
                onChange={handleEmailChange}
                placeholder={lange("Email_Placeholder")}
                helperText={lange("Forget_Email_Tips")}
                InputProps={{
                    endAdornment:
                        email == "" ? null : (
                            <InputAdornment position="end">
                                {status == STATUSES.IDLE ? (
                                    <IconButton
                                        disableRipple
                                        className="email-submit-btn"
                                        onClick={handleSubmit}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                ) : (
                                    <CircularProgress size={20} />
                                )}
                            </InputAdornment>
                        ),
                }}
            />
            <input type="submit" style={{ display: "none" }} />
        </Box>
    );
};

export default ForgetPasswordForm;
