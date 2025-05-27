import {
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    Button,
    Tabs,
    Tab,
} from "@mui/material";
import { useState } from "react";

import useUser from "../../../../hooks/useUser";
import lange from "@i18n";
import UserAccessReport from "@reusableComponents/dataroom/stats/UserAccessReport";
import FileAccessReport from "@reusableComponents/dataroom/stats/FileAccessReport";
import { isMobile } from "react-device-detect";

const MODE = {
    USER: "user",
    DOCUMENT: "document",
};

const DetailedView = ({
    dataroomId,
    includeAdmin = false,
    startTime,
    endTime,
}) => {
    const { axiosInstance } = useUser();
    const [groups, setGroups] = useState([]);
    const [mode, setMode] = useState(MODE.USER);

    const handleModeChange = (event, newValue) => {
        setMode(newValue);
    };

    return (
        <Box display="flex" flexDirection="column" width="100%">
            <Box display="flex" justifyContent="center" width="100%">
                <Tabs
                    value={mode}
                    onChange={handleModeChange}
                    aria-label="change period"
                    TabIndicatorProps={{
                        style: !isMobile && { display: "none" },
                    }}
                >
                    <Tab
                        value={MODE.USER}
                        label={lange("User")}
                        disableRipple
                    />
                    <Tab
                        value={MODE.DOCUMENT}
                        label={lange("Document")}
                        disableRipple
                    />
                </Tabs>
            </Box>

            {mode === MODE.USER && (
                // <UserView
                //     dataroomId={dataroomId}
                //     includeAdmin={includeAdmin}
                //     startTime={startTime}
                //     endTime={endTime}
                // />
                <Box mt={isMobile ? 0 : 2}>
                    {!isMobile && (
                        <Typography variant="h5" textAlign="center">
                            {lange("Group_View")}
                        </Typography>
                    )}
                    <UserAccessReport
                        dataroomId={dataroomId}
                        startTime={startTime}
                        endTime={endTime}
                    />
                </Box>
            )}
            {mode === MODE.DOCUMENT && (
                <Box mt={isMobile ? 0 : 2}>
                    {!isMobile && (
                        <Typography variant="h5" textAlign="center">
                            {lange("Document_View")}
                        </Typography>
                    )}
                    <FileAccessReport
                        dataroomId={dataroomId}
                        startTime={startTime}
                        endTime={endTime}
                    />
                </Box>
            )}
        </Box>
    );
};
export default DetailedView;
