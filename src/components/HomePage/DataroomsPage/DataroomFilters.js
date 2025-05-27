import {
    Stack,
    Box,
    TextField,
    Typography,
    MenuItem,
    Button,
} from "@mui/material";

import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";

// react hooks
import { useState } from "react";
import lange from "@i18n";
import { isMobile } from "react-device-detect";

const DataroomFilters = ({ onSubmit }) => {
    const [createdAt, setCreatedAt] = useState([null, null]);
    const [phase, setPhase] = useState(null);
    const [showFilter, setShowFilter] = useState(isMobile ? false : true);

    const handleSubmit = (e) => {
        e.preventDefault();
        let body = {
            id: e.target.id.value,
            name: e.target.name.value,
            organization: e.target.organization.value,
            phase: e.target.phase.value,
            createdAtStart: createdAt[0] ? new Date(createdAt[0]) : null,
            createdAtEnd: createdAt[1]
                ? new Date(createdAt[1] + 24 * 60 * 60 * 1000)
                : null,
        };

        onSubmit(body);
    };

    const handleReset = (e) => {
        setCreatedAt([null, null]);
        setPhase(null);
        onSubmit({});
    };

    return (
        <Stack
            direction="column"
            mt={isMobile ? 0 : 2}
            spacing={2}
            component="form"
            sx={{
            marginTop: isMobile && "15px"
            }}
            onSubmit={handleSubmit}
            onReset={handleReset}
        >
            {isMobile && (
                <Stack justifyContent="flex-end" direction="row">
                    {
                        !showFilter
                            ? <FilterListIcon onClick={() => setShowFilter(true)} />
                            : <SortIcon sx={{ transform: "rotateY(180deg)" }} onClick={() => setShowFilter(false)} />
                    }
                </Stack>
            )}
            {showFilter && (
                <>
                    <Typography variant="h6" color="primary">
                        {lange("Dataroom_Filter")}
                    </Typography>
                    <TextField
                        name="id"
                        label={lange("Dataroom", "ID")}
                        variant="outlined"
                        type="number"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        name="name"
                        label={lange("Dataroom", "Name")}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        name="organization"
                        label={lange("Dataroom", "Organization")}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                    />

                    <DateRangePicker
                        disableFuture
                        onChange={(newValue) => {
                            setCreatedAt(newValue);
                        }}
                        value={createdAt}
                        localeText={{
                            start: lange("Start") + " (" + lange("Created_At") + ")",
                            end: lange("End") + " (" + lange("Created_At") + ")",
                        }}
                        slotProps={{
                            textField: {
                                InputLabelProps: {
                                    shrink: true,
                                },
                            },
                        }}
                    />

                    <TextField
                        select
                        name="phase"
                        label={lange("Dataroom", "Phase")}
                        variant="outlined"
                        value={phase || ""}
                        onChange={(e) => setPhase(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    >
                        <MenuItem value="Hold">{lange("Hold")}</MenuItem>
                        <MenuItem value="Preparation">{lange("Preparation")}</MenuItem>
                        <MenuItem value="Open">{lange("Open")}</MenuItem>
                    </TextField>

                    <Stack spacing={1} direction="row">
                        <Button type="submit" variant="contained" color="primary" sx={{ flex: 1 }}>
                            {lange("Search")}
                        </Button>
                        <Button type="reset" variant="contained" color="neutral" sx={{ flex: 1 }}>
                            {lange("Reset")}
                        </Button>
                    </Stack>
                </>
            )}

        </Stack>
    );
};

export default DataroomFilters;
