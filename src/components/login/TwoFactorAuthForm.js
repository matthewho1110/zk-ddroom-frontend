import { memo } from "react";

// import mui modules
import { Box, TextField, Typography } from "@mui/material";

const INITAL_OTPS = {
    twoFactorAuthOtp: null,
    smsAuthOtp: null,
    emailAuthOtp: null,
};

const TwoFactorAuth = ({ authenticators, otps, onOtpChange, onSubmit }) => {
    return (
        <Box component="form" onSubmit={onSubmit}>
            <Typography
                variant="h4"
                sx={{ mb: 1, fontWeight: 450 }}
                color="primary"
            >
                Two Step Verification
            </Typography>
            <Typography variant="h5" sx={{ mb: 2 }} color="neutral.main">
                Enter the OTP from your mobile authenticator app
            </Typography>

            {authenticators.includes("mobileAuthenticator") && (
                <TextField
                    sx={{ mb: 3 }}
                    fullWidth
                    variant="outlined"
                    id="mobileAuthenticatorOtpInput"
                    label="Mobile Authenticator OTP"
                    name="mobileAuthenticator"
                    helperText="If you cannot access your mobile authenticator app, please contact your administrator."
                    required
                    size="medium"
                    values={otps.mobileAuthenticator}
                    onChange={onOtpChange}
                >
                    Authenticator Code
                </TextField>
            )}
            {authenticators.smsAuthenticator === true && (
                <TextField sx={{ mb: 31 }}>SMS Authentication</TextField>
            )}
            {authenticators.emailAuthenticator === true && (
                <TextField sx={{ mb: 3 }}>Email Authentication</TextField>
            )}
            <input type="submit" hidden />
        </Box>
    );
};

export default memo(TwoFactorAuth);
