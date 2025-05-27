// import internal modules
import { memo } from "react";

// import external modules

// import mui modules
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { Box, InputAdornment, TextField, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import lange from '@i18n'
import styles from "./LoginPage.module.scss";

const CredentialsInput = styled(TextField)({
    "& label.Mui-focused": {},

    "& .MuiOutlinedInput-root": {
        fontSize: "0.9rem",
        fontWeight: "regular",
        padding: "0.6rem",
    },

    "& .MuiInputBase-input": {
        padding: "0rem",
    },

    "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: "1px",
        borderColor: "#002961",
    },
});

const LoginForm = ({ credentials, onCredentialChange, onSubmit }) => {
   
    return (
        <Box
            display="flex"
            flexDirection="column"
            width="100%"
            component="form"
            onSubmit={onSubmit}
        >
            <Typography
                variant="h4"
                sx={{ mb: 1, fontWeight: 450 }}
                color="primary"
            >
                {lange('Login_Title')}
            </Typography>
            <Typography variant="h5" sx={{ mb: 2 }} color="neutral.main">
                {lange('Login_Des')}
            </Typography>
            <TextField
                sx={{ mb: 1 }}
                variant="outlined"
                id="useremail-input"
                placeholder={lange('Email_Address')}
                name="email"
                required
                fullWidth
                value={credentials.email}
                InputLabelProps={{ style: {} }} // font size of input label
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <EmailIcon
                                style={{
                                    color: "#002961",
                                    fontSize: "1em",
                                }}
                            />
                        </InputAdornment>
                    ),
                }}
                onChange={onCredentialChange}
            />
            <TextField
                fullWidth
                variant="outlined"
                id="password-input"
                type="password"
                placeholder={lange('Password')}
                name="password"
                required
                value={credentials.password}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <LockIcon
                                style={{
                                    color: "#002961",
                                    fontSize: "1em",
                                }}
                            />
                        </InputAdornment>
                    ),
                }}
                onChange={onCredentialChange}
            />

            <input type="submit" hidden />
        </Box>
    );
};

export default LoginForm
