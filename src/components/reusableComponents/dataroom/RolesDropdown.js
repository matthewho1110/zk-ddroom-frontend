import { memo } from "react";

import styled from "@emotion/styled";
import { Box, FormControl, MenuItem, TextField } from "@mui/material";

const StyledSelect = styled(TextField)({});

function RolesDropdown({ roles, onSelect, selectedRole, sx }) {
    return (
        <StyledSelect
            id="role-select"
            value={selectedRole}
            label="Role"
            select
            fullWidth
            InputLabelProps={{
                shrink: true,
            }}
            sx={sx}
        >
            {roles.map((role) => (
                <MenuItem
                    key={role}
                    value={role}
                    onClick={() => {
                        onSelect(role);
                    }}
                >
                    {role}
                </MenuItem>
            ))}
        </StyledSelect>
    );
}

export default memo(RolesDropdown);
