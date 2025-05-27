// internal modules

// external modules
import styled from "@emotion/styled";
import { Button, TextField } from "@mui/material";

const Style1OutlinedInput = styled(TextField)({
    "& label.Mui-focused": {
        color: "#191919",
    },

    "& .MuiOutlinedInput-root": {
        color: "#002961",
        fontWeight: "regular",
        padding: "0.5rem",
    },

    "& .MuiInputBase-input": {
        padding: "0rem",
    },

    "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: "1px",
        borderColor: "#002961",
    },
});

export { Style1OutlinedInput };
