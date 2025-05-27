import { Alert, Box } from "@mui/material";
import PropTypes from "prop-types";

function ErrorPage({ message, severity = "error" }) {
    return (
        <Box
            display="flex"
            justifyContent="center"
            width="100%"
            height="80vh"
            alignItems={"center"}
            marginTop="2%"
            fontSize={16}
        >
            <Alert severity={severity}>{message}</Alert>
        </Box>
    );
}

ErrorPage.propTypes = {
    message: PropTypes.any.isRequired,
};

export default ErrorPage;
