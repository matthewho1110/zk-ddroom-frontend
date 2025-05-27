import { useCallback, useEffect, useState } from "react";

import Grid from "@mui/material/Grid";
import { DataGridPro } from "@mui/x-data-grid-pro";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Box, Button, Stack, Typography, Alert, Divider } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";

import GroupsDropdown from "../../reusableComponents/dataroom/GroupsDropdown";
import MembersDropdown from "../../reusableComponents/dataroom/MemberDropdown";
import ActivityTypesDropdown from "../../reusableComponents/ActivityTypesDropdown";
import { EVENT_TYPES } from "../../../configs/activityConfig";

import useUser from "../../../hooks/useUser";
import useAlert from "../../../hooks/useAlert";
import useSWR from "swr";
import dayjs from "dayjs";
import LinearProgress from "@mui/material/LinearProgress";
import lange from "@i18n";
import { isMobile } from "react-device-detect";
import useDataroomAPI from "@hooks/useDataroomAPI";
import { Interweave, Markup } from "interweave";

// const mokeValue = [
//     {
//         row: {
//             eventType: 'UserGroup_add',
//             timestamp: dayjs(),
//             userGroupId: { name: '测试1' },
//             userId: { firstname: '测试名称' }
//         }
//     },
//     {
//         row: {
//             eventType: 'UserGroup_delete',
//             timestamp: dayjs(),
//             userGroupId: { name: '测试1' },
//             userId: { firstname: '测试名称' }
//         }
//     },
//     {
//         row: {
//             eventType: 'File_upload_file',
//             timestamp: dayjs(),
//             userGroupId: { name: '测试1' },
//             userId: { firstname: '测试名称' }
//         }
//     }
// ]

const INITIAL_FILTERS = {
    groupId: "ALL",
    userId: "ALL",
    startTime: null,
    endTime: null,
    eventCategory: "ALL",
    eventType: "ALL",
};

const MyCustomNoRowsOverlay = () => (
    <Alert severity="info" sx={{ textAlign: "center" }}>
        No activities found.
    </Alert>
);

const ActivityHistoryPage = ({ dataroomId }) => {
    const [pagination, setPagination] = useState({
        page: 0,
    });
    const { axiosInstance } = useUser();
    const { alertHandler } = useAlert();
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    // Default desc
    const [sort, setSort] = useState("desc");
    const [activities, setActivities] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showMore, setShowMore] = useState([]);

    const handleResetFilters = () => {
        setFilters(INITIAL_FILTERS);
        fetchActivities(INITIAL_FILTERS, true, pagination, sort);
    };

    const handleSelectActivityTypeCallback = useCallback((activityType) => {
        setFilters((prev) => ({ ...prev, eventType: activityType }));
    }, []);

    const fetchActivities = async (
        _filters,
        computeTotalResults = false,
        _pagination,
        _sort
    ) => {
        try {
            let page = _pagination.page;
            let pageSize = _pagination.pageSize;

            if (
                dataroomId == null ||
                page == null ||
                pageSize == null ||
                _sort == null ||
                loading
            ) {
                return;
            }
            const locale =
                window && localStorage && localStorage.getItem("local")
                    ? localStorage.getItem("local")
                    : "en";
            const response = await axiosInstance.get(
                `datarooms/${dataroomId}/userActivities`,
                {
                    params: Object.keys(_filters).reduce(
                        (acc, key) => {
                            if (
                                _filters[key] !== null &&
                                _filters[key] !== "ALL"
                            ) {
                                if (key === "startTime") {
                                    acc[key] = new Date(_filters[key]);
                                } else if (key === "endTime") {
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
                            sort: _sort,
                            locale: locale,
                            skip: pageSize * page,
                            limit: pageSize,
                            computeTotalResults: computeTotalResults,
                        }
                    ),
                }
            );

            setActivities(response.data.activities);
            setShowMore((prevState) =>
                response.data.activities.map((item) => {
                    return { _id: item._id, show: false };
                })
            );
            if (computeTotalResults === true) {
                setTotalResults(response.data.totalResults);
            }
            // setPagination((prev) => ({
            //     ...prev,
            //     page: response.data.page,
            //     pageSize: response.data.pageSize,
            // }));
            setLoading(false);
        } catch (err) {
            // setActivities(mokeValue)
            alertHandler(err, {});
            setLoading(false);
        }
    };
    const handleExportCSV = async () => {
        const filterObj = Object.keys(filters).reduce((acc, key) => {
            if (filters[key] !== null && filters[key] !== "ALL") {
                acc[key] = filters[key];
            }
            return acc;
        }, {});

        const params = new URLSearchParams(filterObj);
        fetch(
            `${process.env.BACKEND_URI}/datarooms/${dataroomId}/userActivities/export?` +
                params,
            {
                method: "get",
                credentials: "include",
            }
        )
            .then((res) => res.blob())
            .then((blob) => {
                const aElement = document.createElement("a");
                aElement.setAttribute("download", "user_activities.xlsx");
                const href = URL.createObjectURL(blob);
                aElement.href = href;
                aElement.click();
                URL.revokeObjectURL(href);
            });
    };

    const handleApplyFilters = () => {
        fetchActivities(filters, true, pagination, sort);
    };

    const handlePaginationChange = (value) => {
        setPagination(value);
    };

    const handleOnCellClick = (params) => {
        setShowMore((prevState) =>
            prevState.map((item) => {
                if (item._id === params.row._id) {
                    return { ...item, show: !item.show };
                }
                return item;
            })
        );
    };

    useEffect(() => {
        fetchActivities(filters, true, pagination, sort);
    }, [dataroomId, pagination, sort]);

    const start = filters.startTime ? dayjs(filters.startTime) : null;

    const end = filters.endTime ? dayjs(filters.endTime) : null;

    // Get groups via SWR hook
    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const { data: groups } = useSWR(
        dataroomId ? `/datarooms/${dataroomId}/groups` : null,
        fetcher
    );
    const { getMembers } = useDataroomAPI(dataroomId);

    let { data: members } = getMembers();
    members = members?.filter(
        (member) =>
            member.user.status === "Active" &&
            (filters.groupId === "ALL" || member.group._id === filters.groupId)
    );

    const defaultColumns = [
        {
            flex: 0.1,
            minWidth: 80,
            field: "category",
            headerName: lange("Category"),
            sortable: false,
            valueGetter: (params) => {
                const row = params?.row;
                const eventType = row?.eventType;
                return row.category;
            },
        },
        {
            flex: 0.1,
            minWidth: 90,
            field: "type",
            headerName: lange("Type"),
            sortable: false,
            valueGetter: (params) => {
                const row = params?.row;
                const eventType = row?.eventType;
                return row.name;
            },
        },
        {
            flex: 0.1,
            minWidth: 90,
            field: "user",
            headerName: lange("User"),
            sortable: false,
            valueGetter: (params) => {
                const row = params?.row;
                return row?.userId?.firstname + " " + row?.userId?.lastname;
            },
        },
        {
            flex: 0.1,
            minWidth: 90,
            field: "group",
            headerName: lange("User_Group"),
            sortable: false,
            valueGetter: (params) => params?.row?.userGroupId?.name,
        },
        {
            flex: 0.4,
            minWidth: 200,
            field: "activity",
            headerName: lange("Activity"),
            sortable: false,
            renderCell: (params) => {
                const row = params?.row;
                const eventType = row?.eventType;
                let currentShowMore = showMore.find(
                    (a) => a._id === row._id
                )?.show;
                if (row?.description?.extra) {
                    return currentShowMore ? (
                        <div>
                            <Interweave
                                allowAttributes={true}
                                content={row?.description?.base}
                            />
                            <Interweave
                                allowAttributes={true}
                                content={row?.description?.extra}
                            />
                            <p className="show-hide-btn">hide details</p>
                        </div>
                    ) : (
                        <div>
                            <Interweave
                                allowAttributes={true}
                                content={row?.description?.base}
                            />
                            <p className="show-hide-btn">show more</p>
                        </div>
                    );
                }
                return (
                    <Interweave
                        allowAttributes={true}
                        content={row?.description?.base}
                    />
                );
            },
        },
        {
            flex: 0.15,
            minWidth: 100,
            field: "date",
            headerName: lange("Date"),
            sortable: true,
            valueGetter: (params) => {
                return params?.row?.timestamp;
            },
            valueFormatter: (params) =>
                new Date(params?.value).toLocaleString(),
        },
    ];

    return (
        <Box
            p={isMobile ? 0 : 6}
            pt={isMobile ? 1 : 6}
            width="100%"
            height="100vh"
            display="flex"
            flexDirection="column"
        >
            {!isMobile && (
                <Typography variant="h3" sx={{ mb: 5 }}>
                    {lange("Member_Activities")}
                </Typography>
            )}
            <Stack direction="row" spacing={2} sx={{ mb: "1.5rem" }}>
                <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
                    <GroupsDropdown
                        includeAll={true}
                        groups={groups || []}
                        selectedGroups={filters.groupId}
                        onSelect={(groupId) => {
                            setFilters((prev) => ({
                                ...prev,
                                groupId: groupId,
                                userId: "ALL",
                            }));
                        }}
                        sx={{ width: isMobile ? "47%" : "auto", minWidth: 120 }}
                    />
                    <MembersDropdown
                        includeAll={true}
                        members={members || []}
                        selectedMembers={filters.userId}
                        onSelect={(userId) => {
                            setFilters((prev) => ({
                                ...prev,
                                userId: userId,
                            }));
                        }}
                        sx={{ width: isMobile ? "47%" : "auto", minWidth: 120 }}
                    />
                    <ActivityTypesDropdown
                        selectedActivityType={filters.eventType}
                        onSelect={handleSelectActivityTypeCallback}
                        sx={{ width: isMobile ? "47%" : "auto", minWidth: 120 }}
                    />
                    <DateRangePicker
                        disableFuture
                        sx={{
                            width: isMobile ? "100%" : 300,
                        }}
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

                    <Stack
                        direction="row"
                        spacing={2}
                        width={isMobile ? "100%" : "auto"}
                    >
                        <Button
                            variant="contained"
                            color="neutral"
                            sx={{ width: isMobile ? "33%" : 80 }}
                            onClick={handleResetFilters}
                        >
                            {lange("Reset")}
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ width: isMobile ? "33%" : 80 }}
                            onClick={handleApplyFilters}
                        >
                            {lange("Query")}
                        </Button>

                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{ width: isMobile ? "33%" : 120 }}
                            onClick={handleExportCSV}
                            // sx={{ display: "None" }}
                        >
                            {lange("Export")}
                        </Button>
                    </Stack>
                </Box>
            </Stack>
            {!isMobile && dataroomId && (
                <DataGridPro
                    getRowHeight={() => "auto"}
                    pagination
                    columns={defaultColumns}
                    // disableColumnSelector
                    disableSelectionOnClick
                    disableColumnFilter
                    disableRowSelectionOnClick
                    disableColumnMenu
                    autoPageSize
                    paginationModel={pagination}
                    onCellClick={handleOnCellClick}
                    onPaginationModelChange={(pagination) => {
                        handlePaginationChange(pagination);
                    }}
                    loading={loading}
                    slots={{
                        noResultsOverlay: MyCustomNoRowsOverlay,
                        noRowsOverlay: MyCustomNoRowsOverlay,
                        loadingOverlay: LinearProgress,
                    }}
                    paginationMode="server"
                    rowCount={totalResults}
                    rows={activities}
                    sortingMode="server"
                    onSortModelChange={(model) => {
                        let _sort = model[0]?.sort || "desc";
                        setSort(_sort);
                    }}
                    getRowId={(row) => row._id}
                    sx={{
                        maxWidth: "100%",
                        fontSize: "0.6rem",
                        "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell":
                            { py: "18px" },
                        "& .MuiDataGrid-row:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            // color: "red"
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            fontWeight: 600,
                        },
                        "& .MuiDataGrid-root": {
                            border: "none",
                        },
                        "& .MuiDataGrid-row": {
                            cursor: "pointer",
                        },
                        "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus":
                            {
                                outline: "none !important",
                            },
                        "& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus":
                            {
                                outline: "none !important",
                            },
                    }}
                />
            )}
            {isMobile && (
                <List>
                    {activities.length ? (
                        activities.map((res, idx) => {
                            const row = res;
                            const eventType = row?.eventType;

                            return (
                                <ListItem
                                    key={idx}
                                    sx={{
                                        flexDirection: "column",
                                        padding: "8px 0",
                                    }}
                                >
                                    <Box
                                        display="flex"
                                        sx={{
                                            width: "100%",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography
                                            variant="div"
                                            fontSize="12px"
                                            fontWeight={600}
                                            padding={1}
                                            borderRadius={1}
                                            backgroundColor={
                                                EVENT_TYPES[eventType]
                                                    ?.bgColor || "transparent"
                                            }
                                            color="#fff"
                                        >
                                            {EVENT_TYPES[eventType]?.name}
                                        </Typography>
                                        <Typography
                                            fontSize={"10px"}
                                            variant="span"
                                        >
                                            {new Date(
                                                row?.timestamp
                                            ).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body1"
                                        px={0}
                                        width={"100%"}
                                        fontSize={"16px"}
                                        fontWeight={600}
                                        my={1}
                                    >
                                        {row.description.base}
                                    </Typography>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="flex-start"
                                        width="100%"
                                        mb={1}
                                    >
                                        <Box>
                                            <Typography
                                                variant="caption"
                                                px={0}
                                            >
                                                User
                                            </Typography>
                                            <Typography variant="body1" px={0}>
                                                {row?.userId?.firstname}
                                            </Typography>
                                        </Box>
                                        <Box ml={2}>
                                            <Typography
                                                variant="caption"
                                                px={0}
                                            >
                                                User Group
                                            </Typography>
                                            <Typography variant="body1" px={0}>
                                                {row?.userGroupId?.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Divider
                                        variant="inset"
                                        component="li"
                                        sx={{ marginLeft: 0, width: "100%" }}
                                    />
                                </ListItem>
                            );
                        })
                    ) : (
                        <Typography
                            textAlign={"center"}
                            fontSize={"16px"}
                            variant="body1"
                            fontWeight={600}
                            my={1}
                        >
                            no activities
                        </Typography>
                    )}
                </List>
            )}
        </Box>
    );
};

export default ActivityHistoryPage;
