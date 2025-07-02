import WatermarkSetting from "./WatermarkSetting";

import { Box, Typography, Stack, Tabs, Tab } from "@mui/material";

import { useState } from "react";
import MainSetting from "./MainSetting";
import AdminSetting from "./AdminSetting";
import lange from "@i18n";
import { isMobile } from "react-device-detect";
import useUserProfileQuery from "../../../hooks/useUserProfile";

const SettingPage = ({ dataroomId }) => {
    const [page, setPage] = useState("main");
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const data = useUserProfileQuery();
    const isAdmin = data?.data?.platform_role == "Super Admin";

    return (
        <Box
            display="flex"
            flexDirection="column"
            p={isMobile ? 0 : 6}
            position="relative"
            width="100%"
        >
            <Typography variant="h3" mb={3}>
                {lange("Dataroom", "Settings")}
            </Typography>
            <Box>
                <Tabs
                    value={page}
                    onChange={handlePageChange}
                    aria-label="change page"
                    sx={{ flexGrow: 1 }}
                >
                    <Tab
                        value={"main"}
                        label={lange("Main")}
                        sx={{ typography: "h6" }}
                        disableRipple
                    />
                    <Tab
                        value={"watermark"}
                        label={lange("Watermark")}
                        sx={{ typography: "h6" }}
                        disableRipple
                    />
                    {isAdmin && (
                        <Tab
                            value={"admin"}
                            label={"ADMIN"}
                            sx={{ typography: "h6" }}
                            disableRipple
                        />
                    )}
                </Tabs>
            </Box>

            {page === "watermark" && (
                <WatermarkSetting dataroomId={dataroomId} />
            )}
            {page === "main" && <MainSetting dataroomId={dataroomId} />}
            {page === "admin" && <AdminSetting dataroomId={dataroomId} />}
        </Box>
    );
};

export default SettingPage;
