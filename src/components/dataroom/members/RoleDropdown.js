import { memo } from "react";

import styled from "@emotion/styled";
import { Box, FormControl, MenuItem, TextField } from "@mui/material";

const StyledSelect = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        fontWeight: "regular",
    },

    "& .MuiFormLabel-root.MuiInputLabel-root": {
        transform: "translate(1rem, 0.5rem) scale(1)",
    },

    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
        transform: "translate(1rem, -0.5rem) scale(0.8)",
    },

    "& .MuiFormLabel-root.MuiInputLabel-root.Mui-focused": {
        transform: "translate(1rem, -0.5rem) scale(0.8)",
    },

    "& .MuiInputBase-input": {
        padding: "0.8rem 1rem",
    },
});

function FilePermissionDropdown({
    id,
    type,
    onSelectFilePermission,
    selectedFilePermission,
}) {
    const handleSelect = (e) => {
        onSelectFilePermission(e.target.value);
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            <FormControl sx={{ width: 300, marginRight: 1 }}>
                <StyledSelect
                    id="filePermission-select"
                    value={selectedFilePermission}
                    label="File Permission"
                    select
                    InputLabelProps={{
                        shrink: true,
                    }}
                    onChange={handleSelect}
                >
                    {groups.map((group) => (
                        <MenuItem value={group._id} key={group._id}>
                            {group.name}
                        </MenuItem>
                    ))}
                </StyledSelect>
            </FormControl>
        </Box>
    );
}

export default memo(FilePermissionDropdown);
