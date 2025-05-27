// import custom components
import { DataGrid } from "@mui/x-data-grid";
import { DataGridPro } from "@mui/x-data-grid-pro";
import ContractFilters from "./ContractFilters";
import ErrorPage from "../../reusableComponents/ErrorPage";
import CreateContractForm from "./CreateContractForm";
// MUI components
import LinearProgress from "@mui/material/LinearProgress";
import AddIcon from "@mui/icons-material/Add";

import useUserProfileQuery from "../../../hooks/useUserProfile";

// import external modules
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// import custom hooks
import useAlert from "../../../hooks/useAlert";
import useUser from "../../../hooks/useUser";

// import custom configs
import { ROLES } from "../../../configs/roleConfig";

// import mui modules
import {
    Box,
    Button,
    Modal,
    Skeleton,
    Typography,
    Divider,
    Stack,
    Alert,
    Grid,
} from "@mui/material";
import lange from "@i18n";

const STATUSES = {
    error: -1,
    loading: 0,
    loaded: 1,
};

const MyCustomNoRowsOverlay = () => (
    <Alert severity="info" sx={{ textAlign: "center" }}>
        {lange("No_contracts_found")}
    </Alert>
);

function ContractsPage(props) {
    const router = useRouter();
    const { isLoggedIn, logout, axiosInstance } = useUser();
    const { setAlert, alertHandler } = useAlert();
    const { data } = useUserProfileQuery();
    const [status, setStatus] = useState(STATUSES.loading);
    const [creationFormOpen, setCreationFormOpen] = useState(false);
    const [contracts, setContracts] = useState([]);
    const closeCreationForm = () => setCreationFormOpen(false);
    const openCreationForm = () => setCreationFormOpen(true);
    const CONTRACT_ENTRIES = [
        {
            field: "id",
            headerName: lange("Contract", "ID"),
            type: "string",
            headerAlign: "left",
            align: "left",
            flex: 0.6,
            valueGetter: (params) => params?.row?.id,
        },
        {
            field: "manager",
            headerName: lange("Manager"),
            type: "string",
            flex: 1,
            valueGetter: (params) => {
                if (params?.row?.manager?.status != "Active") {
                    return params?.row?.manager?.email;
                }
                return (
                    params?.row?.manager?.firstname +
                    " " +
                    params?.row?.manager?.lastname
                );
            },
        },
        {
            field: "organization",
            headerName: lange("Organization"),
            type: "string",
            flex: 1,
            valueGetter: (params) => {
                return params?.row?.organization;
            },
        },
        {
            field: "status",
            headerName: lange("Status"),
            type: "string",
            flex: 0.6,
            valueGetter: (params) => {
                return lange(params?.row?.status);
            },
        },

        {
            field: "signAt",
            headerName: lange("Signed_At"),
            type: "date",
            flex: 1,
            valueGetter: (params) => {
                return params?.row?.signAt;
            },
            valueFormatter: (params) => new Date(params?.value).toDateString(),
        },
        {
            field: "startAt",
            headerName: lange("Start_At"),
            type: "date",
            flex: 1,
            valueGetter: (params) => {
                return params?.row?.startAt;
            },
            valueFormatter: (params) => new Date(params?.value).toDateString(),
        },
        {
            field: "expireAt",
            headerName: lange("Expire_At"),
            type: "date",
            flex: 1,
            valueGetter: (params) => {
                return params?.row?.expireAt;
            },
            valueFormatter: (params) => new Date(params?.value).toDateString(),
        },
    ];
    const fetchContracts = async (filters) => {
        setStatus(STATUSES.loading);
        try {
            const contracts = (
                await axiosInstance.get(
                    process.env.BACKEND_URI + "/contracts",
                    {
                        params: filters,
                    }
                )
            ).data;
            setContracts(contracts);

            setStatus(STATUSES.loaded);
        } catch (err) {
            console.log(err);
            setStatus(STATUSES.error);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    if (status === STATUSES.error) {
        return (
            <ErrorPage message="Something went wrong while fetching your contracts. Please refresh to try again later." />
        );
    } else {
        return (
            <Stack
                id="container"
                direction="row"
                height="100%"
                width="100%"
                py={3}
                spacing={3}
            >
                <Grid container spacing={3}>
                    <Grid item xs={12} lg={3}>
                        <Stack
                            direction="column"
                            spacing={3}
                            divider={
                                <Divider orientation="horizontal" flexItem />
                            }
                        >
                            {
                                // if user is admin, show create contract button
                                ["Super Admin"].includes(
                                    data?.platform_role
                                ) && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={openCreationForm}
                                        startIcon={<AddIcon />}
                                    >
                                        {lange("Create", "Contract")}
                                    </Button>
                                )
                            }

                            <ContractFilters
                                onSubmit={(filters) => fetchContracts(filters)}
                            />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} lg={9}>
                        <DataGridPro
                            loading={status === STATUSES.loading}
                            rows={contracts}
                            columns={CONTRACT_ENTRIES}
                            pagination
                            autoPageSize
                            disableColumnSelector
                            disableSelectionOnClick
                            disableColumnFilter
                            disableColumnMenu
                            disableRowSelectionOnClick
                            slots={{
                                noRowsOverlay: MyCustomNoRowsOverlay,
                                loadingOverlay: LinearProgress,
                            }}
                            onRowClick={(params) => {
                                router.push(`/contracts/${params.row._id}`);
                            }}
                            sx={{
                                fontSize: "0.6rem",
                                height: "80vh",
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
                    </Grid>
                </Grid>

                <Modal open={creationFormOpen}>
                    <CreateContractForm onClose={closeCreationForm} />
                </Modal>
            </Stack>
        );
    }
}

export default ContractsPage;
