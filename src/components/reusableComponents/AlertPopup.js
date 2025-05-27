// AlertPopup.js
import { Alert, Snackbar } from "@mui/material";
import useAlert from "../../hooks/useAlert";

const AlertPopup = () => {
    const { text, type, setAlert } = useAlert();

    const handleClose = () => setAlert("", "");

    const isOpen = Boolean(text && type);

    if (isOpen) {
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                sx={{
                    zIndex: 3000,
                }}
                open={isOpen}
                autoHideDuration={5000}
                onClose={handleClose}
            >
                <Alert
                    severity={type}
                    sx={{
                        width: "100%",
                        fontSize: 13,
                    }}
                    onClose={handleClose}
                >
                    {text}
                </Alert>
            </Snackbar>
        );
    } else {
        return <></>;
    }
};

export default AlertPopup;
