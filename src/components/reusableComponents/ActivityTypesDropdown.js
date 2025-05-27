import { memo } from "react";

import styled from "@emotion/styled";
import { Box, Divider, FormControl, MenuItem, TextField } from "@mui/material";

import { EVENT_TYPES } from "../../configs/activityConfig";
import lange from "@i18n";

const StyledSelect = styled(TextField)({});

function ActivityTypesDropdown({
    includeAll = true,
    onSelect,
    selectedActivityType,
    ...props
}) {
    const handleSelect = (e) => {
        onSelect(e.target.value);
    };

    const activityTypesGroupByCategory = Object.keys(EVENT_TYPES).reduce(
        (acc, type) => {
            const category = EVENT_TYPES[type].category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(type);
            return acc;
        },
        {}
    );

    // prepare menu items
    const menuItems = Object.keys(activityTypesGroupByCategory).reduce(
        (acc, category) => {
            acc.push(
                <MenuItem
                    value={category}
                    key={category}
                    disabled
                    sx={{
                        opacity: "1 !important",
                        fontWeight: "bold",
                        color: "primary.main",
                    }}
                >
                    {category}
                </MenuItem>
            );
            activityTypesGroupByCategory[category].map((type) => {
                acc.push(
                    <MenuItem
                        value={type}
                        key={type}
                        sx={{
                            ml: 2,
                        }}
                    >
                        {EVENT_TYPES[type].name}
                    </MenuItem>
                );
            });
            acc.push(<Divider />);
            return acc;
        },
        []
    );

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            {...props}
        >
            <FormControl fullWidth>
                <StyledSelect
                    id="activity-type-select"
                    value={selectedActivityType}
                    label="Activity Type"
                    select
                    InputLabelProps={{
                        shrink: true,
                    }}
                    onChange={handleSelect}
                >
                    {includeAll == true && (
                        <MenuItem value={"ALL"} key={"ALL"}>
                            {lange("All")}
                        </MenuItem>
                    )}
                    <Divider />
                    {menuItems.map((item) => {
                        return item;
                    })}
                </StyledSelect>
            </FormControl>
        </Box>
    );
}

export default memo(ActivityTypesDropdown);
