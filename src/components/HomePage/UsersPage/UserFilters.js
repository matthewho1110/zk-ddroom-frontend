import lange from "@i18n";
import {
    Stack,
    Box,
    TextField,
    Typography,
    MenuItem,
    Button,
} from "@mui/material";

import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";

// react hooks
import { useState } from "react";

const UserFilters = ({ onSubmit }) => {
    const [createdAt, setCreatedAt] = useState([null, null]);
    const [status, setStatus] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        let body = {
            email: e.target.email.value,
            organization: e.target.organization.value,
            status: e.target.status.value,
        };

        onSubmit(body);
    };

    const handleReset = (e) => {
        setCreatedAt([null, null]);
        setStatus(null);
        onSubmit({});
    };

    return (
        <Stack
            direction="column"
            mt={2}
            spacing={2}
            component="form"
            onSubmit={handleSubmit}
            onReset={handleReset}
        >
            <Typography variant="h6" color="primary">
                {lange("User_Filter_Title")}
            </Typography>
            <TextField
                name="email"
                label={lange("User", "Email")}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
            />
            <TextField
                name="organization"
                label={lange("User", "Organization")}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
            />

            <TextField
                select
                name="status"
                label={lange("User", "Status")}
                variant="outlined"
                value={status || ""}
                onChange={(e) => setStatus(e.target.value)}
                InputLabelProps={{ shrink: true }}
            >
                <MenuItem value="Verifying">{lange("Verifying")}</MenuItem>
                <MenuItem value="Active">{lange("Active")}</MenuItem>
            </TextField>

            <Stack spacing={1}>
                <Button type="submit" variant="contained" color="primary">
                    {lange("Search")}
                </Button>
                <Button type="reset" variant="contained" color="neutral">
                    {lange("Reset")}
                </Button>
            </Stack>
        </Stack>
    );
};

export default UserFilters;
