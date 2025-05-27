// React Hooks
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

// Custom Hooks
import useAlert from "../../../hooks/useAlert";
import useUser from "../../../hooks/useUser";

// MUI Components
import {
    Box,
    Typography,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Tabs,
    Tab,
    Stack,
    Divider
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ReplayIcon from "@mui/icons-material/Replay";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";

// Custom Components
import DetailedView from "./detailedView";
import Highlights from "./highlights";
import GroupsDropdown from "../../reusableComponents/dataroom/GroupsDropdown";

// External Modules
import dayjs from "dayjs";
import { isMobile } from "react-device-detect";
import lange from "@i18n";

const PERIODS = {
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
};

const PAGES = {
    highlights: 0,
    detailedView: 1,
};

const INITIAL_PERIOD = {
    startTime: null,
    endTime: null,
};

const STATUSES = {
    LOADING: 0,
    ERROR: 1,
    NO_GROUPS: 2,
    SUCCESS: 3,
};

const Dashboard = ({ dataroomId, onSetTitle }) => {
    // Custom hooks
    const { setAlert } = useAlert();
    const { axiosInstance } = useUser();
    // States
    const [status, setStatus] = useState(STATUSES.LOADING);
    const [page, setPage] = useState(PAGES.highlights);

    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    // Group Filter
    const { data: groups } = useSWR(
        dataroomId ? `/datarooms/${dataroomId}/groups` : null,
        fetcher
    );

    const [groupId, setGroupId] = useState("ALL");

    // Period Filter
    const [period, setPeriod] = useState(INITIAL_PERIOD);

    // Include Admin Filter - deprecated
    const [includeAdmin, setIncludeAdmin] = useState(true);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handlePeriodReset = () => {
        setPeriod(INITIAL_PERIOD);
    };

    useEffect(() => {
        isMobile && onSetTitle(lange("Analytics_Dashboard"))
    }, [])

    // const handleStartTimeChange = (newTime, context) => {
    //     if (endTime && newTime > endTime) {
    //         setAlert("Start time must be before end time", "warning");
    //         return;
    //     }
    //     if (context.validationError == null) {
    //         setStartTime(newTime);
    //     }
    // };
    // const handleEndTimeChange = (newTime, context) => {
    //     if (startTime && newTime < startTime) {
    //         setAlert("End time must be after start time", "warning");
    //         return;
    //     }
    //     if (context.validationError == null) {
    //         setEndTime(newTime);
    //     }
    // };

    const start = period.startTime ? dayjs(period.startTime) : null;

    const end = period.endTime ? dayjs(period.endTime) : null;

    return (
        <Box
            display="flex"
            flexDirection="column"
            p={isMobile ? 0 : 6}
            pt={isMobile ? 0 : 6}
            position="relative"
            width="100%"
        >
            {!isMobile && <Typography variant="h3" mb={3}>
                {lange("Analytics_Dashboard")}
            </Typography>}


            <Stack direction="row" alignItems="center" flexWrap={isMobile && "wrap"} spacing={!isMobile ? 2 : 0} my={isMobile ? 0 : 3}>
                <GroupsDropdown
                    groups={groups || []}
                    includeAll
                    onSelect={(_groupId) => setGroupId(_groupId)}
                    selectedGroups={groupId}
                    sx={{
                        width: 300,
                        marginBottom: isMobile && "15px"
                    }}
                />
                <DateRangePicker
                    disableFuture
                    sx={{
                        marginLeft: isMobile && "0 !important"
                    }}
                    localeText={{
                        start: lange("Period_Start"),
                        end: lange("Period_End"),
                    }}
                    value={[start, end]}
                    onAccept={(newValue) => {
                        setPeriod({
                            startTime: newValue[0],
                            endTime: newValue[1],
                        });
                    }}
                />
                {(period.startTime || period.endTime) && (
                    <IconButton onClick={handlePeriodReset}>
                        <ReplayIcon />
                    </IconButton>
                )}
            </Stack>
            {isMobile && <Divider sx={{ margin: "15px 0 3px" }} />}
            {!isMobile && (
                <Box display="flex" flexDirection="row" alignItems="center" >
                    <Tabs
                        value={page}
                        onChange={handlePageChange}
                        aria-label="change page"
                        sx={{
                            flexGrow: 1,
                        }}

                    >
                        <Tab
                            value={PAGES.highlights}
                            label={lange("Highlights")}
                            disableRipple
                        />
                        <Tab
                            value={PAGES.detailedView}
                            label={lange("Detailed_View")}
                            disableRipple
                        />
                    </Tabs>
                </Box>
            )}
            {isMobile && (
                <Box
                    display="flex"
                    mt="12px"
                    sx={{
                        height: "35px",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #D4D4D4",
                        borderRadius: "5px",
                        overflow: "hidden"
                    }}>
                    <Box
                        flex="1"
                        height="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={page === PAGES.highlights ? {
                            backgroundColor: "#458EF7",
                            color: "#fff"
                        } : {}}
                        onClick={e => handlePageChange(e, PAGES.highlights)}>{lange("Highlights")}</Box>
                    <Box
                        flex="1"
                        display="flex"
                        height="100%"
                        alignItems="center"
                        justifyContent="center"
                        sx={page === PAGES.detailedView ? {
                            backgroundColor: "#458EF7",
                            color: "#fff"
                        } : {}}
                        onClick={e => handlePageChange(e, PAGES.detailedView)}>{lange("Detailed_View")}</Box>
                </Box>
            )}
            {page === PAGES.highlights && (
                <Highlights
                    dataroomId={dataroomId}
                    includeAdmin={includeAdmin}
                    startTime={
                        period.startTime ? new Date(period.startTime) : null
                    }
                    endTime={
                        period.endTime
                            ? new Date(period.endTime + 24 * 60 * 60 * 1000)
                            : null
                    }
                />
            )}
            {page == PAGES.detailedView && (
                <DetailedView
                    dataroomId={dataroomId}
                    includeAdmin={includeAdmin}
                    startTime={
                        period.startTime ? new Date(period.startTime) : null
                    }
                    endTime={
                        period.endTime
                            ? new Date(period.endTime + 24 * 60 * 60 * 1000)
                            : null
                    }
                />
            )}
        </Box>
    );
};

export default Dashboard;
