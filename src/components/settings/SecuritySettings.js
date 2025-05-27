// import mui modules
import KeyIcon from "@mui/icons-material/Key";
import EnhancedEncryptionIcon from "@mui/icons-material/EnhancedEncryption";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Modal,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

// import internal modules
import axios from "axios";
import { useEffect, useState } from "react";
import useAlert from "../../hooks/useAlert";
import useUser from "../../hooks/useUser";
import MobileAuthenticatorActivationForm from "./MobileAuthenticatorActivationForm";
import ChangePasswordForm from "./ChangePasswordForm";
import useUserProfileQuery from "../../hooks/useUserProfile";

import useConfirmationDialog from "../../hooks/useConfirmationDialog";
import lange from "@i18n";
import SMSAuthenticatorActivationForm from "./SmsAuthenticatorActivationForm";
import useUserAPI from "@hooks/useUserAPI";

// import external modules
import { formatPhoneNumberIntl } from "react-phone-number-input";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height
    };
}
  
function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
        setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}
  
function SecuritySettings(props) {
    const { axiosInstance } = useUser();

    const { getEnabledAuthenticators } = useUserAPI();

    const {
        data: authenticators,
        mutate: mutateAuthenticators,
        isLoading,
    } = getEnabledAuthenticators();

    const { alertHandler, setAlert } = useAlert();
    const { data } = useUserProfileQuery();
    const [
        mobileAuthenticatorActivationOpen,
        setMobileAuthenticatorActivationOpen,
    ] = useState(false);

    const [smsAuthenticatorActivationOpen, setSmsAuthenticatorActivationOpen] =
        useState(false);
    const [changePasswordFormOpen, setChangePasswordFormOpen] = useState(false);

    const hasMobileAuthenticator = authenticators?.hasOwnProperty(
        "mobileAuthenticator"
    );

    const phone = formatPhoneNumberIntl(
        "+" +
            authenticators?.smsAuthenticator?.phoneCountry?.phone +
            " " +
            authenticators?.smsAuthenticator?.phoneNumber
    );

    const hasSmsAuthenticator =
        authenticators?.hasOwnProperty("smsAuthenticator");

    // To check if the authenticators have changed, cuz useEffect dep is able to check object
    const authObj =
        typeof authenticators === "object"
            ? JSON.stringify(authenticators)
            : "{}";

    const { setConfirmationDialog } = useConfirmationDialog();

    /** Functions */

    // const getAuthenticators = async () => {
    //     try {
    //         const authenticators = (
    //             await axiosInstance.get(
    //                 `${process.env.BACKEND_URI}/auth/enabledAuthenticators`
    //             )
    //         )?.data;

    //         setAuthenticators(authenticators);
    //     } catch (err) {
    //         alertHandler(err);
    //     }
    // };

    const enableMobileAuthenticator = () => {
        // As the endpoint calling is done in MobileAuthenticatorActivation component
        // we just need to close the modal and update the state
        setMobileAuthenticatorActivationOpen(false);
        mutateAuthenticators();
        setAlert(
            "Mobile authenticator has been enabled successfully",
            "success"
        );
    };

    const handleEnableSmsSuccess = () => {
        // As the endpoint calling is done in MobileAuthenticatorActivation component
        // we just need to close the modal and update the state
        setSmsAuthenticatorActivationOpen(false);

        mutateAuthenticators();
        setAlert(
            "Two-factor authentication has been enabled successfully",
            "success"
        );
    };

    const disableMobileAuthenticator = async () => {
        try {
            await axiosInstance.put(
                `${process.env.BACKEND_URI}/mobileAuthenticator/disable`,
                {}
            );
            // remove mobile authenticator from the array
            mutateAuthenticators();
            setAlert(
                "Mobile authenticator has been disabled successfully",
                "success"
            );
        } catch (err) {
            alertHandler(err);
        }
    };

    const disableSmsAuthenticator = async () => {
        try {
            await axiosInstance.put(
                `${process.env.BACKEND_URI}/smsAuthenticator/disable`,
                {}
            );
            // remove mobile authenticator from the array
            mutateAuthenticators();
            setAlert(
                "Sms authenticator has been disabled successfully",
                "success"
            );
        } catch (err) {
            alertHandler(err);
        }
    };

    const { height, width } = useWindowDimensions();
    // Generate 2FA secret
    return (
        <>
            <Box
                display="flex"
                flexDirection="column"
                height="100vh"
                width="100%"
                pt={6}
            >
                <Box pl={6}>
                    <Typography variant="h2" color="primary" mb={1}>
                        {lange("Security_Settings")}
                    </Typography>
                    <Typography variant="h5" color="neutral.dark">
                        {lange("Security_Settings_Description")}
                    </Typography>
                </Box>
                <Box display="flex" flexDirection={width < height ? "column" : "row"} height="100%">
                    <Box
                        width={width < height ? "100%" : "50%"}
                        borderRadius={2}
                        backgroundColor="white"
                        p={6}
                    >
                        <Typography
                            variant="h4"
                            mb={5}
                            display="flex"
                            alignItems="center"
                        >
                            {lange("Login_Credentials")}{" "}
                        </Typography>
                        <Stack direction="column" spacing={3}>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                pb={2}
                                borderBottom="2px solid lightgray"
                            >
                                <Typography variant="h5" sx={{ width: "100%" }}>
                                    {lange("Email")}:
                                </Typography>
                                <Typography variant="h5">
                                    {data?.email}
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                pb={2}
                                borderBottom="2px solid lightgray"
                            >
                                <Typography variant="h5" sx={{ width: "100%" }}>
                                    {lange("Password")}:
                                </Typography>
                                <Typography variant="h5 ">
                                    ************
                                </Typography>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    onClick={() => {
                                        setChangePasswordFormOpen(true);
                                    }}
                                >
                                    {lange("Change")}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                    <Divider orientation= {width < height ? "horizontal" : "vertical"}/>
                    <Box
                        width={width < height ? "100%" : "50%"}
                        borderRadius={2}
                        p={6}
                        backgroundColor="white"
                    >
                        <Typography
                            variant="h4"
                            mb={5}
                            display="flex"
                            alignItems="center"
                        >
                            {lange("Advanced_Security")}
                        </Typography>
                        <Stack direction="column" spacing={3}>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                pb={2}
                                borderBottom="2px solid lightgray"
                            >
                                <Typography variant="h5" sx={{ width: "100%" }}>
                                    {lange("Mobile_Authenticator")}
                                </Typography>
                                {authenticators === null ? (
                                    <CircularProgress />
                                ) : (
                                    <Button
                                        color={
                                            hasMobileAuthenticator
                                                ? "error"
                                                : "primary"
                                        }
                                        variant="contained"
                                        onClick={() => {
                                            if (hasMobileAuthenticator) {
                                                setConfirmationDialog({
                                                    title: "Disable 2FA",
                                                    description:
                                                        "Are you sure you want to disable 2FA?",
                                                    onCancel: () => {},
                                                    onConfirm: () => {
                                                        disableMobileAuthenticator();
                                                    },
                                                });
                                            } else {
                                                setMobileAuthenticatorActivationOpen(
                                                    true
                                                );
                                            }
                                        }}
                                    >
                                        {authenticators?.hasOwnProperty(
                                            "mobileAuthenticator"
                                        )
                                            ? lange("Disable")
                                            : lange("Enable")}
                                    </Button>
                                )}
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                pb={2}
                                borderBottom="2px solid lightgray"
                            >
                                <Typography variant="h5" sx={{ width: "100%" }}>
                                    {lange("SMS_Authenticator")}{" "}
                                    {hasSmsAuthenticator && (
                                        <span
                                            style={{
                                                fontSize: 14,
                                            }}
                                        >
                                            {phone}
                                        </span>
                                    )}
                                </Typography>

                                {authenticators === null ? (
                                    <CircularProgress />
                                ) : (
                                    <Button
                                        color={
                                            hasSmsAuthenticator
                                                ? "error"
                                                : "primary"
                                        }
                                        variant="contained"
                                        onClick={() => {
                                            if (hasSmsAuthenticator) {
                                                setConfirmationDialog({
                                                    title: "Disable SMS Authenticator",
                                                    description:
                                                        "Are you sure you want to disable SMS autenticator?",
                                                    onCancel: () => {},
                                                    onConfirm: () => {
                                                        disableSmsAuthenticator();
                                                    },
                                                });
                                            } else {
                                                setSmsAuthenticatorActivationOpen(
                                                    true
                                                );
                                            }
                                        }}
                                    >
                                        {authenticators?.hasOwnProperty(
                                            "smsAuthenticator"
                                        )
                                            ? lange("Disable")
                                            : lange("Enable")}
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </Box>
                </Box>
            </Box>
            {
                // Mobile Authenticator Activation Modal
                mobileAuthenticatorActivationOpen && (
                    <Modal
                        sx={{ display: "flex" }}
                        open={mobileAuthenticatorActivationOpen}
                    >
                        <Box
                            m="auto"
                            maxHeight="80vh"
                            overflow="auto"
                            p={2}
                            backgroundColor="white"
                            borderRadius={2}
                        >
                            {" "}
                            <MobileAuthenticatorActivationForm
                                onClose={() =>
                                    setMobileAuthenticatorActivationOpen(false)
                                }
                                onSubmit={enableMobileAuthenticator}
                            />
                        </Box>
                    </Modal>
                )
            }

            {
                // Mobile Authenticator Activation Modal
                smsAuthenticatorActivationOpen && (
                    <Modal
                        sx={{ display: "flex" }}
                        open={smsAuthenticatorActivationOpen}
                    >
                        <Box
                            m="auto"
                            maxHeight="80vh"
                            overflow="auto"
                            p={2}
                            backgroundColor="white"
                            borderRadius={2}
                        >
                            {" "}
                            <SMSAuthenticatorActivationForm
                                onClose={() =>
                                    setSmsAuthenticatorActivationOpen(false)
                                }
                                onSubmit={handleEnableSmsSuccess}
                            />
                        </Box>
                    </Modal>
                )
            }

            {
                // Change Password Modal
                changePasswordFormOpen && (
                    <Modal
                        sx={{ display: "flex" }}
                        open={changePasswordFormOpen}
                    >
                        <ChangePasswordForm
                            onClose={() => setChangePasswordFormOpen(false)}
                            onSubmit={() => setChangePasswordFormOpen(false)}
                        />
                    </Modal>
                )
            }
        </>
    );
}

export default SecuritySettings;
