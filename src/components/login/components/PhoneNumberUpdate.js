import {
    Box,
    Button,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControlLabel,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useState } from "react";
import { PAGES } from "../models/common";

const PhoneNumberUpdate = ({ setCurrentPage }) => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState("+1");

    const handleBack = () => {
        setCurrentPage(PAGES.HOME);
    };

    const hendleCountryCodeChange = (event) => {
        setCountryCode(event.target.value);
    };

    const handleValidate = () => {
        setCurrentPage(PAGES.PHONENUMBER);
    };

    const countryCodes = [
        {
            label: "United States(+1)",
            value: "+1",
        },
        {
            label: "China(+86)",
            value: "+86",
        },
        {
            label: "UK(+44)",
            value: "+44",
        },
    ];

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="start"
            justifyContent="center"
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
                Validation Required
            </Typography>
            <Typography
                variant="caption"
                style={{ color: "#000", fontSize: 16 }}
            >
                Enter your old phone number. This is the number you used
                authenticate in the past:
                <Box>
                    <b> +852 XXXX X935.</b>
                </Box>
            </Typography>
            <Typography
                variant="caption"
                fontSize={16}
                mt={4}
                mb={1}
                style={{ color: "#000" }}
            >
                Country Code
            </Typography>
            <Box width="60%">
                <Select
                    value={countryCode}
                    onChange={hendleCountryCodeChange}
                    fullWidth
                >
                    {countryCodes.map((code) => (
                        <MenuItem key={code.value} value={code.value}>
                            {code.label}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
            <Typography
                variant="caption"
                fontSize={16}
                mt={4}
                mb={1}
                style={{ color: "#000" }}
            >
                Phone Number
            </Typography>
            <Box width="60%">
                <TextField
                    fullWidth
                    variant="outlined"
                    label="000-000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
            </Box>
            <Box mt={3} width="60%" textAlign="right">
                <Button
                    onClick={handleValidate}
                    variant="contained"
                    disabled={phoneNumber.length === 0}
                >
                    Validate
                </Button>
            </Box>
        </Box>
    );
};

export default PhoneNumberUpdate;
