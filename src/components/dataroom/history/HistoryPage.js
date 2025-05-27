/**
 *
 *
 *  Legacy Page
 *
 *
 */

// Custom hooks
import useUser from "../../../hooks/useUser";
import useAlert from "../../../hooks/useAlert";

// Internal hooks
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

// MUI components
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Button,
    LinearProgress,
    Pagination,
    List,
    ListItem,
} from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";

// Custom configs
import { EVENT_TYPES } from "../../../configs/activityConfig";

// Custom components
import GroupsDropdown from "../../reusableComponents/dataroom/GroupsDropdown";
import ActivityTypesDropdown from "../../reusableComponents/ActivityTypesDropdown";

// External modules
import dayjs from "dayjs";
import lange from "@i18n";
import MembersDropdown from "../../reusableComponents/dataroom/MemberDropdown";
import { isMobile } from "react-device-detect";

const INITIAL_FILTERS = {
    groupId: "ALL",
    userId: null,
    startTime: null,
    endTime: null,
    eventType: "ALL",
};

const PAGE_SIZE = 10;

const HistoryPage = ({ dataroomId }) => {
    const { axiosInstance } = useUser();
    const { alertHandler, setAlert } = useAlert();
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [activities, setActivities] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(false);

    // Get groups via SWR hook
    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const { data: groups } = useSWR(
        dataroomId ? `/datarooms/${dataroomId}/groups` : null,
        fetcher
    );

    const handleResetFilters = () => {
        setFilters(INITIAL_FILTERS);
        fetchActivities(INITIAL_FILTERS, 0, true);
    };

    const handleSelectActivityTypeCallback = useCallback((activityType) => {
        setFilters((prev) => ({ ...prev, eventType: activityType }));
    }, []);

    const fetchActivities = async (
        _filters,
        page,
        computeTotalResults = false
    ) => {
        alert("s");
        try {
            setLoading(true);
            const response = await axiosInstance.get(
                `datarooms/${dataroomId}/userActivities`,

                {
                    params: Object.keys(_filters).reduce(
                        (acc, key) => {
                            if (
                                _filters[key] !== null &&
                                _filters[key] !== "ALL"
                            ) {
                                if (key == "startTime") {
                                    acc[key] = new Date(_filters[key]);
                                } else if (key == "endTime") {
                                    acc[key] = new Date(
                                        _filters[key] + 24 * 60 * 60 * 1000
                                    );
                                } else {
                                    acc[key] = _filters[key];
                                }
                            }
                            return acc;
                        },
                        {
                            skip: page * PAGE_SIZE,
                            limit: PAGE_SIZE,
                            computeTotalResults: computeTotalResults,
                        }
                    ),
                }
            );
            setActivities(response.data.activities);
            if (computeTotalResults == true) {
                setTotalResults(response.data.totalResults);
            }
            setLoading(false);
        } catch (err) {
            alertHandler(err, {});
            setLoading(false);
        }
    };
    const handleExportCSV = async () => {
        const response = await axiosInstance.get(
            `datarooms/${dataroomId}/userActivities/export`,

            {
                params: Object.keys(filters).reduce((acc, key) => {
                    if (filters[key] !== null && filters[key] !== "ALL") {
                        acc[key] = filters[key];
                    }
                    return acc;
                }, {}),
            }
        );
        var encodedUri = encodeURI(response.data);
        var link = document.createElement("a");
        link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
        link.setAttribute("download", `user_activities.csv`);
        document.body.appendChild(link); // Required for FF
        link.click();

        // let exportData = activities.map((activity) => {
        //     const activityDetails = EVENT_TYPES[activity.eventType];
        //     return {
        //         Activity: activityDetails?.description(activity),
        //         Type: activityDetails?.type,
        //         User:
        //             activity.userId?.firstname +
        //             " " +
        //             activity.userId?.lastname,
        //         "User Group": activity.userGroupId?.name,
        //         Date: new Date(activity.timestamp).toLocaleString(),
        //     };
        // });
        // console.log(exportData);
        // const csv = Papa.unparse(exportData);
        // const downloadLink = document.createElement("a");
        // downloadLink.setAttribute(
        //     "href",
        //     "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
        // );
        // downloadLink.setAttribute("download", "export.csv");
        // downloadLink.click();
    };

    const handleApplyFilters = () => {
        fetchActivities(filters, 0, true);
    };

    const handlePageChange = (event, value) => {
        fetchActivities(filters, value - 1, false);
    };

    useEffect(() => {
        if (dataroomId) {
            fetchActivities(filters, 0, true);
        }
    }, [dataroomId]);

    const start = filters.startTime ? dayjs(filters.startTime) : null;

    const end = filters.endTime ? dayjs(filters.endTime) : null;

    return (
        <Box
            p={isMobile ? 0 : 6}
            pt={isMobile && 1}
            width="100%"
            height="100vh"
            display="flex"
            flexDirection="column"
        >
            {!isMobile && (
                <Typography variant="h3" sx={{ mb: 5 }}>
                    Member Activities
                </Typography>
            )}

            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                sx={{ mb: 5 }}
            >
                <Box
                    display="flex"
                    width={isMobile ? "100%" : "80%"}
                    flexWrap="wrap"
                    gap={2}
                    alignItems="center"
                >
                    <GroupsDropdown
                        includeAll={true}
                        groups={groups || []}
                        selectedGroups={filters.groupId}
                        onSelect={(groupId) => {
                            setFilters((prev) => ({
                                ...prev,
                                groupId: groupId,
                            }));
                        }}
                        sx={{ width: isMobile ? "47.5%" : 200 }}
                    />
                    <MembersDropdown
                        includeAll={true}
                        groups={groups || []}
                        selectedGroups={filters.groupId}
                        onSelect={(groupId) => {
                            setFilters((prev) => ({
                                ...prev,
                                groupId: groupId,
                            }));
                        }}
                        sx={{ width: 120 }}
                    />
                    <ActivityTypesDropdown
                        selectedActivityType={filters.eventType}
                        onSelect={handleSelectActivityTypeCallback}
                        sx={{ width: isMobile ? "47.5%" : 200 }}
                    />

                    <DateRangePicker
                        sx={{ width: isMobile ? "100%" : "auto" }}
                        disableFuture
                        localeText={{
                            start: lange("Start"),
                            end: lange("End"),
                        }}
                        value={[start, end]}
                        onChange={(newValue) => {
                            setFilters((prev) => ({
                                ...prev,
                                startTime: newValue[0],
                                endTime: newValue[1],
                            }));
                        }}
                    />
                    <Button
                        variant="contained"
                        color="neutral"
                        sx={{ width: 80 }}
                        onClick={handleResetFilters}
                    >
                        {lange("Reset") + "ds"}
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ width: 80 }}
                        onClick={handleApplyFilters}
                    >
                        {lange("Query")}
                    </Button>

                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{ width: 120 }}
                        onClick={handleExportCSV}
                        // sx={{ display: "None" }}
                    >
                        {lange("Export")}
                    </Button>
                </Box>

                {/* <Stack
                    direction="column"
                    spacing={1}
                    alignItems="end"
                    width={isMobile ? "100%" : "20%"}
                >
                    <Button
                        variant="contained"
                        color="neutral"
                        sx={{ width: isMobile ? "auto" : 200 }}
                        onClick={handleResetFilters}
                    >
                        {lange('Reset')} {lange('Filters')}
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ width: isMobile ? "auto" : 200 }}
                        onClick={handleApplyFilters}
                    >
                        {lange('Filters')}
                    </Button>

                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{ width: isMobile ? "auto" : 200 }}
                        onClick={handleExportCSV}
                    // sx={{ display: "None" }}
                    >
                        {lange('Export_To_Csv')}
                    </Button>
                </Stack>*/}
            </Stack>
            {!isMobile && (
                <TableContainer
                    sx={{
                        height: "100%",
                        width: "100%",
                        position: "relative",
                    }}
                >
                    <Table
                        sx={{
                            backgroundColor: "white",
                            zIndex: 999,
                            position: "sticky",
                            top: 0,
                            left: 0,
                        }}
                    >
                        <TableRow>
                            <TableCell width="40%">
                                {lange("Activity")}
                            </TableCell>
                            <TableCell width="10%" align="left">
                                {lange("Type")}
                            </TableCell>
                            <TableCell width="20%" align="left">
                                {lange("User")}
                            </TableCell>
                            <TableCell width="20%">
                                {lange("User_Group")}
                            </TableCell>
                            <TableCell width="10%" align="left">
                                {lange("Date")}
                            </TableCell>
                        </TableRow>
                        {loading && (
                            <>
                                <LinearProgress
                                    sx={{
                                        position: "absolute",
                                        width: "100%",
                                        bottom: 0,
                                    }}
                                />
                            </>
                        )}

                        <TableBody
                            sx={{
                                backgroundColor: "white",
                                width: "100%",
                                overflow: "auto",
                            }}
                        >
                            {!loading &&
                                activities.map((activity) => {
                                    const activityDetails =
                                        EVENT_TYPES[activity.eventType];

                                    return (
                                        <TableRow
                                            key={activity.id}
                                            sx={{
                                                "&:last-child td, &:last-child th":
                                                    {
                                                        border: 0,
                                                    },

                                                width: "100%",
                                            }}
                                        >
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {activityDetails?.description(
                                                    activity
                                                )}
                                            </TableCell>
                                            <TableCell align="left">
                                                {activityDetails?.name}
                                            </TableCell>
                                            <TableCell align="left">
                                                {activity.userId?.firstname +
                                                    " " +
                                                    activity.userId?.lastname}
                                            </TableCell>
                                            <TableCell align="left">
                                                {activity.userGroupId?.name}
                                            </TableCell>
                                            <TableCell align="left">
                                                {new Date(
                                                    activity.timestamp
                                                ).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {isMobile && <Box></Box>}
            <Box display="flex" justifyContent="end" mt={2}>
                <Pagination
                    count={Math.floor(totalResults / PAGE_SIZE)}
                    color="primary"
                    onChange={handlePageChange}
                />
            </Box>
        </Box>
    );
};

export default HistoryPage;
