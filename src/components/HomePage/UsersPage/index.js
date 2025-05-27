// import custom components
import { DataGridPro } from "@mui/x-data-grid-pro";
import UserFilters from "./UserFilters";
import ErrorPage from "../../reusableComponents/ErrorPage";
// MUI components
import LinearProgress from "@mui/material/LinearProgress";
import AddIcon from "@mui/icons-material/Add";
import useUserProfileQuery from "../../../hooks/useUserProfile";

// import external modules
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { formatPhoneNumberIntl } from "react-phone-number-input";

// import custom hooks
import useAlert from "../../../hooks/useAlert";
import useUser from "../../../hooks/useUser";

// import custom configs
import { ROLES } from "../../../configs/roleConfig";

// import mui modules
import {
    Menu,
    MenuItem,
    Divider,
    Stack,
    Alert,
    Grid,
    IconButton,
    Modal,
    Box,
    Typography,
} from "@mui/material";
import { MoreHorizOutlined } from "@mui/icons-material";
import lange from "@i18n";
import { DataroomsList } from "@components/reusableComponents/dataroom";

const STATUSES = {
    error: -1,
    loading: 0,
    loaded: 1,
};

const ITEM_HEIGHT = 48;

const MyCustomNoRowsOverlay = () => (
    <Alert severity="info" sx={{ textAlign: "center" }}>
        No users found
    </Alert>
);

const INITIAL_MENU = {
    anchorEl: null,
    top: 0,
    left: 0,
    user: null,
};

function UsersPage() {
    const router = useRouter();
    const { isLoggedIn, logout, axiosInstance } = useUser();
    const { setAlert, alertHandler } = useAlert();
    const { data } = useUserProfileQuery();

    const [status, setStatus] = useState(STATUSES.loading);
    const [creationFormOpen, setCreationFormOpen] = useState(false);
    const [users, setUsers] = useState([]);

    const [menu, setMenu] = useState(INITIAL_MENU);

    const [selectedUser, setSelectedUser] = useState(null);

    const menuOpen = Boolean(menu.anchorEl);

    const closeMenu = () => setMenu(INITIAL_MENU);

    const fetchUsers = async (filters) => {
        setStatus(STATUSES.loading);
        try {
            setUsers(
                (
                    await axiosInstance.get(
                        process.env.BACKEND_URI + "/users",
                        {
                            params: filters,
                        }
                    )
                ).data
            );

            setStatus(STATUSES.loaded);
        } catch (err) {
            console.log(err);
            setStatus(STATUSES.error);
        }
    };

    const resendRegistrationEmail = async (email) => {
        try {
            if (!email) {
                throw new Error();
            }
            await axiosInstance.post("/register/sendEmail", {
                email,
            });
            setAlert(
                "Registration email has been resent successfully.",
                "success"
            );
        } catch (err) {
            setAlert(
                "Encountered error when resending registration email.",
                "error"
            );
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const USER_ENTRIES = [
        {
            field: "email",
            headerName: lange("Email"),
            type: "string",
            headerAlign: "left",
            align: "left",
            flex: 0.6,
            valueGetter: (params) => params?.row?.email,
        },
        {
            field: "name",
            headerName: lange("Name"),
            type: "string",
            flex: 1,
            valueGetter: (params) =>
                params?.row?.status == "Active"
                    ? params?.row?.firstname + " " + params?.row?.lastname
                    : "N/A",
        },
        {
            field: "organization",
            headerName: lange("Organization"),
            type: "string",
            flex: 1,
            valueGetter: (params) => {
                return params?.row?.status == "Active"
                    ? params?.row?.organization
                    : "N/A";
            },
        },
        {
            field: "phone",
            headerName: lange("Phone"),
            type: "string",
            flex: 1,
            valueGetter: (params) => {
                return params?.row?.status == "Active"
                    ? formatPhoneNumberIntl(params?.row?.phone) ||
                          params?.row?.phone
                    : "N/A";
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
            field: "action",
            headerName: lange("Actions"),
            sortable: false,
            renderCell: (params) => {
                if (params?.row?.status == "Active") return <></>;
                return (
                    <IconButton
                        onClick={(e) =>
                            setMenu({
                                anchorEl: e.currentTarget,
                                top: e.clientY,
                                left: e.clientX,
                                user: params?.row,
                            })
                        }
                    >
                        <MoreHorizOutlined />
                    </IconButton>
                );
            },
        },
    ];

    if (status === STATUSES.error) {
        return (
            <ErrorPage message="Something went wrong while fetching users. Please refresh to try again later." />
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
                            <UserFilters
                                onSubmit={(filters) => fetchUsers(filters)}
                            />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} lg={9}>
                        <DataGridPro
                            loading={status === STATUSES.loading}
                            rows={users}
                            columns={USER_ENTRIES}
                            pagination
                            autoPageSize
                            disableColumnSelector
                            disableSelectionOnClick
                            disableColumnFilter
                            disableColumnMenu
                            disableRowSelectionOnClick
                            getRowId={(row) => row._id}
                            onRowClick={(params) => {
                                if (params?.row?.status == "Active") {
                                    setSelectedUser(params?.row);
                                }
                            }}
                            slots={{
                                noRowsOverlay: MyCustomNoRowsOverlay,
                                loadingOverlay: LinearProgress,
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
                <Menu
                    id="action-menu"
                    MenuListProps={{
                        "aria-labelledby": "action-button",
                    }}
                    anchorEl={menu.anchorEl}
                    open={menuOpen}
                    onClose={() => closeMenu()}
                    PaperProps={{
                        style: {
                            maxHeight: ITEM_HEIGHT * 4.5,
                            width: "200px",
                        },
                    }}
                    elevation={1}
                    transformOrigin={{
                        horizontal: "right",
                        vertical: "top",
                    }}
                    anchorOrigin={{
                        horizontal: "right",
                        vertical: "bottom",
                    }}
                >
                    <MenuItem
                        key={"action-send-registration-email"}
                        onClick={() => {
                            resendRegistrationEmail(menu.user?.email);
                            closeMenu();
                        }}
                    >
                        {lange("Resend_Registration_Email")}
                    </MenuItem>
                </Menu>
                <Modal
                    open={!!selectedUser}
                    onClose={() => setSelectedUser(null)}
                >
                    <Box
                        sx={{
                            marginTop: 5,
                            background: "white",
                            width: "80%",
                            mx: "auto",
                            p: 5,
                            overflowY: "auto",
                            borderRadius: 2,
                            height: "80vh",
                        }}
                    >
                        <Typography variant="h4" mb={3}>
                            Security Questions
                        </Typography>
                        <Box mb={3}>
                            {
                                <Stack spacing={1}>
                                    {selectedUser?.securityQuestions?.map(
                                        (question, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    border: "1px solid",
                                                    borderColor: "grey.300",
                                                    borderRadius: 2,
                                                    p: 2,
                                                }}
                                            >
                                                <Typography variant="h6" mb={1}>
                                                    {question.question}
                                                </Typography>
                                                <Typography variant="body1">
                                                    {question.answer}
                                                </Typography>
                                            </Box>
                                        )
                                    )}
                                </Stack>
                            }
                        </Box>

                        <Typography variant="h4" mb={3}>
                            {selectedUser?.firstname} {selectedUser?.lastname} (
                            {selectedUser?.email}) 's datarooms
                        </Typography>
                        <Box height="60%">
                            <DataroomsList
                                filters={{ userId: selectedUser?._id }}
                            />
                        </Box>
                    </Box>
                </Modal>
            </Stack>
        );
    }
}

export default UsersPage;
