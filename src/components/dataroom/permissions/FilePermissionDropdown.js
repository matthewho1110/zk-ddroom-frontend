import { memo } from "react";

import styled from "@emotion/styled";
import { Box, FormControl, MenuItem, TextField } from "@mui/material";

// import internal modules
import { PERMISSIONS } from "../../../configs/permissionConfig";

const PermissionSelect = styled(TextField)({
    "& .MuiInputBase-input": {
        fontSize: "0.8125rem",
    },
    "& .MuiList-root": {
        fontSize: "0.8125rem",
    },
});

function FilePermissionDropdown({
    isRoot,
    permissionType,
    onFilePermissionChange,
    currentFilePermission,
    originalFilePermission,
}) {
    const permissions = PERMISSIONS(permissionType, isRoot);

    const handlePermissionChange = (e) => {
        onFilePermissionChange(permissionType, parseInt(e.target.value));
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            <FormControl sx={{ width: 300, marginRight: 1 }}>
                <PermissionSelect
                    id="filePermission-select"
                    value={currentFilePermission}
                    select
                    variant="standard"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    InputProps={{
                        style: {
                            color:
                                currentFilePermission == originalFilePermission
                                    ? "black"
                                    : "var(--secondary-color-2)",
                        },
                    }}
                    onChange={handlePermissionChange}
                >
                    {permissions &&
                        Object.keys(permissions).map((pid) => (
                            <MenuItem
                                value={pid}
                                key={pid}
                                disabled={currentFilePermission == pid}
                            >
                                {permissions[pid]}
                            </MenuItem>
                        ))}
                </PermissionSelect>
            </FormControl>
        </Box>
    );
}

export default memo(FilePermissionDropdown);
