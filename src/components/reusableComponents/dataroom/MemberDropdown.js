import { memo } from "react";

import styled from "@emotion/styled";
import { MenuItem, TextField } from "@mui/material";

import lange from "@i18n";

const StyledSelect = styled(TextField)({});

function MembersDropdown({
    onSelect,
    selectedMembers,
    members = [],
    multiple = false,
    includeAll = false,
    sx,
}) {
    return (
        <StyledSelect
            id="member-select"
            value={selectedMembers}
            label={lange("User")}
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
                ...(includeAll
                    ? [
                          {
                              _id: "ALL",
                              user: {
                                  _id: "ALL",
                                  firstname: lange("All"),
                              },
                          },
                      ]
                    : []),
                ...members,
            ].map((member) => (
                <MenuItem value={member.user?._id} key={member._id}>
                    {member.user?.firstname} {member.user?.lastname}
                </MenuItem>
            ))}
        </StyledSelect>
    );
}

export default memo(MembersDropdown);
