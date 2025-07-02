import { Box, Typography, Stack, Tabs, Tab } from "@mui/material";
import { isMobile } from "react-device-detect";
import { useState } from "react";
import GoogleMeeting from "./GoogleMeeting";
import ZoomMeeting from "./ZoomMeeting";
import lange from "@i18n";

const MeetingPage = ({ dataroomId }) => {
    const [page, setPage] = useState("google");
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            p={isMobile ? 0 : 6}
            position="relative"
            width="100%"
        >
            <Typography variant="h3" mb={3}>
                {lange("Meeting")}
            </Typography>
            <Box>
                <Tabs
                    value={page}
                    onChange={handlePageChange}
                    aria-label="change page"
                    sx={{ flexGrow: 1 }}
                >
                    <Tab
                        value={"google"}
                        label="GOOGLE"
                        sx={{ typography: "h6" }}
                        disableRipple
                    />
                    {/* <Tab
                        value={"zoom"}
                        label="ZOOM"
                        sx={{ typography: "h6" }}
                        disableRipple
                    /> */}
                </Tabs>
            </Box>
            {page === "google" && <GoogleMeeting dataroomId={dataroomId} />}
            {/* {page === "zoom" && <ZoomMeeting dataroomId={dataroomId} />} */}
        </Box>
    );
};

export default MeetingPage;
