import Calendar from "./Calendar";
import { Box, Typography } from "@mui/material";
import lange from "@i18n";

const EventsPage = ({ dataroomId }) => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            p={6}
            position="relative"
            width="100%"
            height="100vh"
        >
            <Typography variant="h3" marginBottom={4}>
                {lange("Events")}
            </Typography>
            <Calendar />
        </Box>
    );
};

export default EventsPage;
