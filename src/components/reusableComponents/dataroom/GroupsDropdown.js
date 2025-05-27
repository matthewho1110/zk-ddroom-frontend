import { memo } from "react";

import styled from "@emotion/styled";
import { MenuItem, TextField } from "@mui/material";
import lange from "@i18n";

const StyledSelect = styled(TextField)({});

function GroupsDropdown({
    onSelect,
    selectedGroups,
    groups = [],
    multiple = false,
    includeAll = false,
    sx,
}) {
    return (
        <StyledSelect
            id="group-select"
            value={selectedGroups}
            label={lange("Group")}
            select
            fullWidth
            sx={sx}
            InputLabelProps={{
                shrink: true,
            }}
            SelectProps={{
                multiple: multiple,
            }}
            onChange={(e) => {
                onSelect(e.target.value);
            }}
        >
            {[
                ...(includeAll ? [{ _id: "ALL", name: lange("All") }] : []),
                ...groups,
            ].map((group) => (
                <MenuItem value={group._id} key={group._id}>
                    {group.name}
                </MenuItem>
            ))}
        </StyledSelect>
    );
}

export default memo(GroupsDropdown);
