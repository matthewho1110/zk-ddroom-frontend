import { useState, memo } from "react";
import { Button, Box, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import Prefer from "./components/Prefer";
import PhoneNumber from "./components/PhoneNumber";
import PhoneNumberUpdate from "./components/PhoneNumberUpdate";
import { PAGES, STEPS } from "./models/common";
import { useRouter } from "next/router";

import { formatPhoneNumberIntl } from "react-phone-number-input";

const TwoFactorAuth = ({
    uid,
    authenticators,
    setStep,
    otp,
    onOtpSubmit,
    onOtpChange,
}) => {
    const [currentPage, setCurrentPage] = useState(PAGES.HOME);
    const router = useRouter();
    const phone = formatPhoneNumberIntl(
        "+" +
            authenticators.smsAuthenticator?.phoneCountry?.phone +
            " " +
            authenticators.smsAuthenticator?.phoneNumber
    );

    return (
        <>
            {currentPage === PAGES.HOME && (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="start"
                    justifyContent="center"
                >
                    <Button
                        startIcon={<ArrowBackOutlinedIcon />}
                        style={{
                            color: "#6C6C6C",
                            padding: 0,
                            marginBottom: "2rem",
                            textTransform: "none",
                            fontSize: 16,
                        }}
                        variant="text"
                        onClick={() => setStep(STEPS.LOGIN)}
                    >
                        Back to Previous Page
                    </Button>
                    <Typography
                        variant="h4"
                        sx={{ mb: 2 }}
                        style={{ color: "#2E59A9" }}
                    >
                        Two Factor Authentication
                    </Typography>
                    <Typography
                        variant="h5"
                        style={{
                            color: "#000",
                            marginBottom: "2rem",
                        }}
                        mb={2}
                    >
                        Choose one of the following options to verify your
                        identity:
                    </Typography>
                    {authenticators.hasOwnProperty("mobileAuthenticator") && (
                        <Box
                            display="flex"
                            color="#2E59AA"
                            borderRadius="10px"
                            alignItems="center"
                            justifyContent="space-between"
                            bgcolor="#F4FAFF"
                            px="20px"
                            py="25px"
                            mb="1rem"
                            style={{ cursor: "pointer" }}
                            sx={{
                                typography: "h5",
                            }}
                            onClick={() => setCurrentPage(PAGES.PREFERRED)}
                        >
                            <Box>
                                Get a code from your mobile authenticator app
                            </Box>
                            <ArrowForwardIosOutlinedIcon />
                        </Box>
                    )}

                    {authenticators.hasOwnProperty("smsAuthenticator") && (
                        <Box>
                            <Box
                                display="flex"
                                color="#2E59AA"
                                borderRadius="10px"
                                alignItems="center"
                                justifyContent="space-between"
                                bgcolor="#F4FAFF"
                                px="20px"
                                py="25px"
                                mb="1.5rem"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                    setCurrentPage(PAGES.PHONENUMBER)
                                }
                            >
                                <Box
                                    sx={{
                                        typography: "h5",
                                    }}
                                    marginRight
                                >
                                    Text (SMS) a code to {phone}
                                </Box>
                                <ArrowForwardIosOutlinedIcon />
                            </Box>
                            <Box color="#353535" sx={{ typography: "h5" }}>
                                Unable to verify your identity?
                            </Box>
                            <Box
                                color="#2E59AA"
                                sx={{ typography: "h5", cursor: "pointer" }}
                                onClick={() => router.push("https://ddroom.io")}
                            >
                                Contact Support
                            </Box>
                        </Box>
                    )}
                </Box>
            )}
            {currentPage === PAGES.PREFERRED && (
                <Prefer
                    setCurrentPage={setCurrentPage}
                    otp={otp?.mobileAuthenticator}
                    onChange={onOtpChange}
                    onSubmit={onOtpSubmit}
                />
            )}
            {currentPage === PAGES.PHONENUMBER && (
                <PhoneNumber
                    setCurrentPage={setCurrentPage}
                    otp={otp?.smsAuthenticator}
                    phone={phone}
                    onChange={onOtpChange}
                    onSubmit={onOtpSubmit}
                    uid={uid}
                />
            )}
            {currentPage === PAGES.UPDATEPHONENUMBER && (
                <PhoneNumberUpdate setCurrentPage={setCurrentPage} />
            )}
        </>
    );
};

export default memo(TwoFactorAuth);
