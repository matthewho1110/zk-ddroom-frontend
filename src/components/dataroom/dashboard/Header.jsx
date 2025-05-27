import { Box, Typography, useTheme } from "@mui/material";

const Header = ({ title, subtitle }) => {
    const theme = useTheme();
    return (
        <Box mb="30px">
            <Box
                color={"primary"}
                sx={{ m: "0 0 5px 0", fontSize: "3rem", fontWeight: 600 }}
            >
                {title}
            </Box>
            <Typography variant="h5" color={"primary"}>
                {subtitle}
            </Typography>
        </Box>
    );
};

export default Header;
