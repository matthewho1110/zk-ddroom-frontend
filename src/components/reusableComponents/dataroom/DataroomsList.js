import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// MUI components
import {
    LinearProgress,
    Alert,
    Stack,
    Typography,
    Box,
    Button,
} from "@mui/material";

import { DataGridPro } from "@mui/x-data-grid-pro";

import useAlert from "../../../hooks/useAlert";
import useUser from "../../../hooks/useUser";
import useUserProfileQuery from "../../../hooks/useUserProfile";
import { ROLES } from "../../../configs/roleConfig";
import lange from "@i18n";

// Custom components
import WelcomeContent from "./WelcomeContent";
import { isMobile } from "react-device-detect";

const STATUSES = {
    error: -1,
    loading: 0,
    loaded: 1,
};

const PHASE_COLOR = {
    Hold: "#c2b13e",
    Preparation: "#404457",
    Open: "#5c844d",
};

const MyCustomNoDataroomsOverlay = () => (
    <Alert severity="info" sx={{ textAlign: "center" }}>
        No datarooms found
    </Alert>
);

const DataroomsList = ({ filters }) => {
    // States
    const [status, setStatus] = useState(STATUSES.loading);
    const [datarooms, setDatarooms] = useState([]);

    // Hooks
    const router = useRouter();
    const { setAlert } = useAlert();
    const { axiosInstance } = useUser();
    const { data } = useUserProfileQuery();
    const DATAROOM_ENTRIES = [
        {
            field: "id",
            headerName: lange("Dataroom", "ID"),
            flex: 0.6,
            type: "string",
            valueGetter: (params) => params?.row?.id,
        },
        {
            field: "name",
            headerName: lange("Dataroom", "Name"),
            flex: 1,
            type: "string",
            valueGetter: (params) => params?.row?.name,
        },
        {
            field: "organization",
            headerName: lange("Organization"),
            flex: 1,
            type: "string",
            valueGetter: (params) => {
                return params?.row?.organization;
            },
        },
        {
            field: "createdAt",
            headerName: lange("Created_At"),
            flex: 1,
            type: "date",
            valueGetter: (params) => {
                return params?.row?.createdAt;
            },
            valueFormatter: (params) => new Date(params?.value).toDateString(),
        },
        {
            field: "phase",
            headerName: lange("Phase"),
            flex: 0.6,
            type: "string",
            valueGetter: (params) => {
                return lange(params?.row?.phase);
            },
        },
    ];

    const DATAROOM_ENTRIES_MOBILE = [
        {
            field: "id",
            headerName: lange("Dataroom", "ID"),
            type: "string",
            flex: 1,
            valueGetter: (params) => params?.row?.id,
            renderCell: ({ row }) => {
                const { id, name, organization, phase, createdAt } = row;
                return (
                    <Box>
                        <Box display="flex">
                            <Stack>
                                <Typography sx={{ fontSize: "12px" }}>
                                    {lange("Dataroom", "ID")}
                                </Typography>
                                <Typography sx={{ fontSize: "16px" }}>
                                    {id}
                                </Typography>
                            </Stack>
                            <Stack ml="15px">
                                <Typography sx={{ fontSize: "12px" }}>
                                    {lange("Dataroom", "Name")}
                                </Typography>
                                <Typography sx={{ fontSize: "16px" }}>
                                    {name}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box display="flex" mt="10px" alignItems="center">
                            <Stack mr="30px">
                                <Typography sx={{ fontSize: "12px" }}>
                                    {lange("Organization")}
                                </Typography>
                                <Typography sx={{ fontSize: "16px" }}>
                                    {organization}
                                </Typography>
                            </Stack>
                            <Stack>
                                <Typography sx={{ fontSize: "12px" }}>
                                    {lange("Created_At")}
                                </Typography>
                                <Typography sx={{ fontSize: "16px" }}>
                                    {new Date(createdAt).toDateString()}
                                </Typography>
                            </Stack>
                            <Button
                                sx={{
                                    marginLeft: "15px",
                                    height: "24px",
                                    width: "115px",
                                    backgroundColor: PHASE_COLOR[phase],
                                }}
                                variant="contained"
                            >
                                {phase}
                            </Button>
                        </Box>
                    </Box>
                );
            },
        },
    ];

    const fetchDatarooms = async () => {
        setStatus(STATUSES.loading);
        try {
            const datarooms = (
                await axiosInstance.get(
                    process.env.BACKEND_URI + "/datarooms",
                    {
                        params: filters,
                    }
                )
            ).data;
            setDatarooms(datarooms);

            setStatus(STATUSES.loaded);
        } catch (err) {
            console.log(err);
            setStatus(STATUSES.error);
        }
    };

    useEffect(() => {
        fetchDatarooms();
    }, [filters]);

    if (status == STATUSES.error) {
        return <Alert severity="error">Error loading datarooms</Alert>;
    }

    return (
        <>
            <DataGridPro
                loading={status === STATUSES.loading}
                rows={datarooms}
                columns={isMobile ? DATAROOM_ENTRIES_MOBILE : DATAROOM_ENTRIES}
                autoPageSize
                disableColumnMenu
                pagination
                disableRowSelectionOnClick
                // disableColumnSelector
                disableSelectionOnClick
                disableColumnFilter
                scrollbarSize={0}
                rowHeight={isMobile ? 130 : 52}
                getRowId={(row) => row._id}
                slots={
                    isMobile
                        ? {
                              columnHeaders: () => null,
                              noRowsOverlay: MyCustomNoDataroomsOverlay,
                              noResultsOverlay: MyCustomNoDataroomsOverlay,
                              loadingOverlay: LinearProgress,
                          }
                        : {
                              noRowsOverlay: MyCustomNoDataroomsOverlay,
                              noRowsOverlay: MyCustomNoDataroomsOverlay,
                              loadingOverlay: LinearProgress,
                          }
                }
                onRowClick={(params) => {
                    if (
                        data?.platform_role !== "Super Admin" &&
                        !ROLES[params.row.myRole]?.activePhases.includes(
                            params.row.phase
                        )
                    ) {
                        setAlert(
                            "You are not allowed to access this dataroom at this phase yet.",
                            "warning"
                        );
                    } else {
                        router.push(
                            `/dataroom/${
                                params.row._id
                            }/files?filePath=${encodeURIComponent("/root")}`
                        );
                    }
                }}
                getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 != 0 && "even"
                }
                sx={{
                    fontSize: "0.6rem",
                    "& .MuiDataGrid-row:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                        // color: "red"
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        fontWeight: 600,
                    },
                    "&.MuiDataGrid-root": {
                        border: isMobile && 0,
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
                    "& .MuiDataGrid-cell": {
                        borderBottom: isMobile && 0,
                    },
                    // "& .even": {
                    //     background: "#f5f5f5",
                    // },
                }}
            />
        </>
    );
};

export default DataroomsList;
