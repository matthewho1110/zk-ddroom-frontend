import { Box, Tab, Tabs } from "@mui/material";
import { FC, ReactNode, SyntheticEvent, memo, useState } from "react";
import AdminActivityHistory from "./AdminActivityHistory/AdminActivityHistory";
import AdminDataroom from "./AdminDataroom/AdminDataroom";
import AdminUser from "./AdminUser/AdminUser";
import lange from "@i18n";

interface TabPanelProps {
    children?: ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
            style={{ width: "100%", height: "100%", padding: "3rem" }}
        >
            {value === index && children}
        </div>
    );
}

type AdminPageProps = {};

const AdminPage: FC<AdminPageProps> = () => {
    const [value, setValue] = useState(0);

    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    /* make all tabpanel 100vw */

    return (
        <Box display="flex" height="calc(100vh - 80px)" width="100%">
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                sx={{ borderRight: 1, borderColor: "divider" }}
            >
                <Tab label={lange("Dataroom")} />
                <Tab label={lange("User")} />
                <Tab label="Activity History" />
            </Tabs>

            {/* make all tabpanel 100vw */}

            <TabPanel value={value} index={0}>
                <AdminDataroom />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <AdminUser />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <AdminActivityHistory />
            </TabPanel>
        </Box>
    );
};

export default memo(AdminPage);
