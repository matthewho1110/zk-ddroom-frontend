import { Box, Button, Typography, TextField, Stack } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useState, useEffect } from "react";
import { PAGES } from "../models/common";
import useUser from "@hooks/useUser";

const PhoneNumber = ({
    setCurrentPage,
    otp,
    onChange,
    onSubmit,
    uid,
    phone,
}) => {
    const { axiosInstance } = useUser();

    const [cooldown, setCooldown] = useState(0);

    const handleNext = () => {};

    const handleBack = () => {
        setCurrentPage(PAGES.HOME);
    };

    const sendSms = async () => {
        try {
            setCooldown(60);
            await axiosInstance.post(`/smsAuthenticator/loginOtp`, {
                uid,
            });
            setCooldown(60);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        sendSms();
        const interval = setInterval(() => {
            setCooldown((prev) => prev > 0 && prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="start"
            justifyContent="center"
            component="form"
            onSubmit={onSubmit}
        >
            <Button
                onClick={handleBack}
                startIcon={<ArrowBackOutlinedIcon />}
                style={{
                    color: "#6C6C6C",
                    padding: 0,
                    marginBottom: "2rem",
                    textTransform: "none",
                    fontSize: 16,
                }}
                variant="text"
            >
                Back to Previous Page
            </Button>
            <Typography
                variant="h4"
                sx={{ mb: 2 }}
                style={{ color: "#2E59A9" }}
            >
                Verify Your Identity
            </Typography>
            <Typography
                variant="caption"
                style={{ color: "#000", fontSize: 16 }}
            >
                Check your mobile device. We sent a code to <b>{phone}.</b>
            </Typography>
            <Typography
                variant="caption"
                fontSize={16}
                mt={4}
                mb={1}
                style={{ color: "#000" }}
            >
                Verification Code
            </Typography>
            <Box width="60%" mb={1}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="6-digit code"
                    name="smsAuthenticator"
                    value={otp}
                    onChange={onChange}
                />
            </Box>
            <Typography variant="caption" fontSize={14}>
                Didn’t get the SMS?
                <Button
                    variant="text"
                    sx={{ "&:hover": { backgroundColor: "transparent" } }}
                    onClick={sendSms}
                    disableRipple
                    disabled={cooldown > 0}
                >
                    Resend {cooldown > 0 ? `(${cooldown.toFixed(0)})` : ""}
                </Button>
            </Typography>

            <Box
                display="flex"
                justifyContent="space-between"
                width="100%"
                textAlign="right"
            >
                <Stack direction="row" spacing={1} alignItems="center"></Stack>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={!otp?.length}
                >
                    Next
                </Button>
            </Box>
        </Box>
    );
};

export default PhoneNumber;
