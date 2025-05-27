import PropTypes from "prop-types";
import { memo } from "react";

import styled from "@emotion/styled";
import { Box, FormControl, MenuItem, TextField } from "@mui/material";

import { DATAROOM_PERMISSIONS } from "../../configs/permissionConfig";

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

function GroupsDropdown({ groups, onSelectGroup, selectedGroup }) {
    const handleSelect = (e) => {
        onSelectGroup(e.target.value);
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            <FormControl sx={{ width: 300, marginRight: 1 }}>
                <StyledSelect
                    id="group-select"
                    value={selectedGroup}
                    label="Group"
                    select
                    InputLabelProps={{
                        shrink: true,
                    }}
                    onChange={handleSelect}
                >
                    {groups.map((group) => (
                        <MenuItem value={group._id} key={group._id}>
                            {group.name}
                            &nbsp; &nbsp;
                            {group.permissionLevel != null && (
                                <>
                                    {"(" +
                                        DATAROOM_PERMISSIONS[
                                            group.permissionLevel
                                        ]?.name +
                                        ")"}
                                </>
                            )}
                        </MenuItem>
                    ))}
                </StyledSelect>
            </FormControl>
        </Box>
    );
}

GroupsDropdown.propTypes = {
    groups: PropTypes.array.isRequired,
    onSelectGroup: PropTypes.func.isRequired,
    selectedGroup: PropTypes.string.isRequired,
};

export default memo(GroupsDropdown);
