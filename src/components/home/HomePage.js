// import internal modules
import { DataGrid } from "@mui/x-data-grid";
import useAlert from "../../hooks/useAlert";
import useUser from "../../hooks/useUser";
import ErrorPage from "../reusableComponents/ErrorPage";
import CreateDataroomForm from "./CreateDataroomForm";
import WelcomeContent from "./WelcomeContent";

// MUI components
import LinearProgress from "@mui/material/LinearProgress";
import styles from "./HomePage.module.scss";

import useUserProfileQuery from "../../hooks/useUserProfile";

// import external modules
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// import custom configs
import { ROLES } from "../../configs/roleConfig";
import lange from "@i18n";

// import mui modules
import {
    Box,
    Button,
    Modal,
    Skeleton,
    Typography,
    Stack,
    Alert,
} from "@mui/material";
import lange from "@i18n";

const STATUSES = {
    error: -1,
    loading: 0,
    loaded: 1,
};

const DATAROOM_ENTRIES = [
    {
        field: "id",
        headerName: lange("Dataroom", "ID"),
        width: 265,
        type: "string",
        headerAlign: "left",
        align: "left",
        valueGetter: (params) => params?.row?.id,
    },
    {
        field: "name",
        headerName: lange("Dataroom", "Name"),
        width: 200,
        type: "string",
        valueGetter: (params) => params?.row?.name,
    },

    {
        field: "owner",
        headerName: lange("Owner"),
        width: 130,
        type: "string",
        valueGetter: (params) => params?.row?.owner,
    },
    {
        field: "organization",
        headerName: lange("Organization"),
        width: 180,
        type: "string",
        valueGetter: (params) => {
            return params?.row?.organization;
        },
    },
    {
        field: "createdAt",
        headerName: lange("Created_At"),
        width: 180,
        type: "date",
        valueGetter: (params) => {
            return params?.row?.createdAt;
        },
        valueFormatter: (params) => new Date(params?.value).toDateString(),
    },
    {
        field: "lastUpdate",
        headerName: lange("Last_Update"),
        width: 180,
        type: "date",
        valueGetter: (params) => {
            return params?.row?.lastUpdate;
        },
        valueFormatter: (params) => new Date(params?.value).toDateString(),
    },
    {
        field: "phase",
        headerName: lange("Phase"),
        width: 180,
        type: "string",
        valueGetter: (params) => {
            return params?.row?.phase;
        },
    },
];

const MyCustomNoRowsOverlay = () => (
    <Alert severity="info" sx={{ textAlign: "center" }}>
        No datarooms found
    </Alert>
);

function HomePage() {
    const router = useRouter();
    const { isLoggedIn, logout, axiosInstance } = useUser();
    const { setAlert, alertHandler } = useAlert();
    const { data } = useUserProfileQuery();

    const [status, setStatus] = useState(STATUSES.loading);
    const [creationFormOpen, setCreationFormOpen] = useState(false);
    const [datarooms, setDatarooms] = useState([]);

    const closeCreationForm = () => setCreationFormOpen(false);
    const openCreationForm = () => setCreationFormOpen(true);

    const fetchAllDatarooms = async () => {
        try {
            const datarooms = (
                await axiosInstance.get(process.env.BACKEND_URI + "/datarooms")
            ).data;
            setDatarooms(datarooms);

            setStatus(STATUSES.loaded);
        } catch (err) {
            console.log(err);
            setStatus(STATUSES.error);
        }
    };

    // const rowRenderer = (props) => {
    //     console.log("rowProps:", props);
    //     alert("sd");
    //     return <div {...props} />;
    // };

    useEffect(() => {
        data?._id && fetchAllDatarooms();
    }, [data?._id]);

    if (!isLoggedIn) {
        return (
            <ErrorPage
                message={
                    <>
                        You have to <a href="/login">login</a> first to enter
                        this page
                    </>
                }
            />
        );
    } else if (status === STATUSES.error) {
        return (
            <ErrorPage message="Something went wrong while fetching your datarooms. Please refresh to try again later." />
        );
    } else {
        return (
            <Box
                id="container"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                width="100%"
                py={6}
                px={12}
                height="120vh"
            >
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-end"
                    mb={3}
                >
                    <Stack direction="column">
                        <Typography variant="h3" color="primary">
                            Your Datarooms
                        </Typography>
                        <Typography variant="body1" color="neutral.dark">
                            Please select a dataroom from the below list to
                            continue
                        </Typography>
                    </Stack>

                    {
                        // if user is admin, show create dataroom button
                        ["Admin", "Super Admin"].includes(data?.type) && (
                            <Typography
                                className="link-btn"
                                variant="h6"
                                onClick={openCreationForm}
                            >
                                {lange("Create", "Dataroom")}
                            </Typography>
                        )
                    }
                </Box>
                {/* 
                {status == STATUSES.loaded &&
                    // 10 loading placeholders skeleton

                    [...Array(10)].map((_, i) => (
                        <Skeleton
                            key={i}
                            variant="rectangular"
                            width={1315}
                            height={50}
                            sx={{ maxWidth: "100%", mb: 1 }}
                        />
                    ))} */}

                <DataGrid
                    loading={status === STATUSES.loading}
                    rows={datarooms}
                    columns={DATAROOM_ENTRIES}
                    pageSize={15}
                    rowsPerPageOptions={[15]}
                    disableColumnSelector
                    disableSelectionOnClick
                    disableColumnFilter
                    disableColumnMenu
                    slots={{
                        NoRowsOverlay: MyCustomNoRowsOverlay,
                        LoadingOverlay: LinearProgress,
                    }}
                    onRowClick={(params) => {
                        if (
                            !ROLES[params.row.myRole]?.activePhases.includes(
                                params.row.phase
                            )
                        ) {
                            setAlert(
                                "You are not allowed to access this dataroom at this phase yet.",
                                "warning"
                            );
                            return;
                        }
                        router.push(
                            `/dataroom/${
                                params.row.id
                            }/files?filePath=${encodeURIComponent("/root")}`
                        );
                    }}
                    sx={{
                        width: 1315,
                        maxWidth: "100%",
                        fontSize: "0.6rem",
                        "& .MuiDataGrid-row:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                            // color: "red"
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            fontWeight: 600,
                        },
                        "& .MuiDataGrid-columnSeparator": {
                            display: "none",
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
                <Modal
                    open={creationFormOpen}
                    onClose={closeCreationForm}
                    className={styles.creationFormModal}
                >
                    <CreateDataroomForm />
                </Modal>
            </Box>
        );
    }
}

export default HomePage;
