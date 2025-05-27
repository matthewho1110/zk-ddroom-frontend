import { Box, Button, Typography, TextField } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useState } from "react";
import { PAGES } from "../models/common";

const list = [
    "Microsoft Authenticator",
    "Google Authenticator",
    "OneLogin",
    "Authy",
    "LastPass Authenticator",
];

const Prefer = ({ setCurrentPage, otp, onSubmit, onChange }) => {
    const handleBack = () => {
        setCurrentPage(PAGES.HOME);
    };

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
                Enter the 6-digit verification code provided by your preferred
                authenticator. Works with:
            </Typography>
            <Box>
                <ul style={{ paddingLeft: 24, margin: 4 }}>
                    {list.map((item) => (
                        <li
                            key={item}
                            style={{ marginBottom: 6, fontSize: 16 }}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            </Box>
            <Typography
                variant="caption"
                fontSize={16}
                mt={5}
                mb={1}
                style={{ color: "#000" }}
            >
                Verification Code
            </Typography>
            <Box display="flex" width="100%" flexDirection="row" gap={1}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="6-digit code"
                    name="mobileAuthenticator"
                    onChange={onChange}
                    value={otp}
                    required
                />

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

export default Prefer;
