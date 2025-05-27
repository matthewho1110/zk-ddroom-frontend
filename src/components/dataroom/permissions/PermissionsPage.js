// import internal modules
import useUser from "../../../hooks/useUser";
import GroupsDropdown from "../../reusableComponents/dataroom/GroupsDropdown";

import File from "./File";
import { PERMISSION_LEVELS } from "../../../configs/permissionConfig";
// import mui modules
import styled from "@emotion/styled";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import FileMobileView from "./FileMobileView";
import {
    Box,
    Button,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import ErrorPage from "../../reusableComponents/ErrorPage";

// import external modules
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import useAlert from "../../../hooks/useAlert";
import useSWR from "swr";
import lange from "@i18n";
import { isMobile } from "react-device-detect";

const FileFilter = styled(TextField)({
    "& .MuiInputBase-root.MuiOutlinedInput-root": {
        padding: "6px 16px",
        height: "100%",
    },
    "& .MuiInputBase-input.MuiOutlinedInput-input": {
        lineHeight: 1.75,
        padding: 0,
    },
    "& .MuiInput-input.MuiInputBase-input.Mui-disabled": {
        "-webkit-text-fill-color": "rgb(0, 0, 0)", // (default alpha is 0.38)
    },
});

const NOTIFICATIONS = {
    ERROR: -1,
    NONE: 0,
    RESET: 1,
    SAVE: 2,
};

const STATUSES = {
    loading: 0,
    error: 1,
    noGroups: 2,
    success: 3,
};

const INITIAL_NOTIFICATION = {
    action: "none",
    affectedFiles: [],
    timestamp: null,
};

const PermissionsPage = ({ dataroomId }) => {
    const [status, setStatus] = useState(STATUSES.loading);
    const [groupId, setGroupId] = useState("");
    const [permissionsChanges, setPermissionsChanges] = useState({});
    const { setAlert, alertHandler } = useAlert();
    const { axiosInstance } = useUser();
    const [notification, setNotification] = useState(INITIAL_NOTIFICATION);

    // Get groups via SWR hook
    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const {
        data: groups,
        error: groupError,
        loading: groupLoading,
    } = useSWR(dataroomId ? `/datarooms/${dataroomId}/groups` : null, fetcher);

    // Filter out the "Not assigned" group
    const filteredGroups = groups?.filter(
        (group) => group.name !== "Not Assigned"
    );

    /** Variables */
    const isEditing = Object.keys(permissionsChanges).length > 0;

    const handlePermissionChange = async (
        fileId,
        permissionType,
        enabled
    ) => { };

    const handlePermissionChangeCallback = useCallback(
        handlePermissionChange,
        []
    );

    const handleSubmitPermissionsChanges = async () => {
        try {
            await axiosInstance.put(
                `${process.env.BACKEND_URI}/datarooms/${dataroomId}/filePermissions`,
                permissionsChanges,
                {
                    params: {
                        groupId,
                    },
                }
            );
            setAlert("Permissions updated successfully", "success");
        } catch (err) {
            alertHandler(err);
        }
    };

    useEffect(() => {
        if (filteredGroups?.length > 0 && !groupId) {
            setGroupId(filteredGroups[0]._id);
        }
    }, [groups]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            position="relative"
            width="100%"
            height="100vh"
            p={isMobile ? 0 : 6}
        >
            {!isMobile && <Typography variant="h3">{lange("Permission_Control")}</Typography>}
            <Box marginTop={isMobile ? 0 : 5} display="flex">
                <GroupsDropdown
                    sx={{ width: 300 }}
                    selectedGroups={groupId}
                    groups={filteredGroups || []}
                    onSelect={(groupId) => {
                        setGroupId(groupId);
                    }}
                />
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        display: "flex",
                        marginLeft: "auto",
                        padding: "0.2rem 0",
                    }}
                >
                    {isEditing && (
                        <>
                            {/* <Button
                                variant="contained"
                                startIcon={<RestartAltIcon />}
                                color="error"
                                onClick={handleResetPermissionsChanges}
                            >
                                Cancel
                            </Button> */}
                            <Button
                                variant="contained"
                                startIcon={<SaveAltIcon />}
                                onClick={handleSubmitPermissionsChanges}
                            >
                                {lange("Save")}
                            </Button>
                        </>
                    )}
                    {/* <FileFilter
                        value={filter}
                        InputLabelProps={{
                            shrink: true,
                            style: { display: "none" },
                        }}
                        placeholder="folder or file name"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        onChange={handleFilterChange}
                        name="filter"
                        style={{ marginRight: "1rem" }}
                    /> */}
                </Stack>
            </Box>

            <Paper
                sx={{
                    height: "100%",
                    width: "100%",
                    position: "relative",
                    overflow: "hidden",
                    marginTop: isMobile ? "30px" : "1.5rem",
                    boxShadow: isMobile && "none"
                }}
            >
                {groupId && !isMobile && (
                    <TableContainer
                        sx={{
                            height: "100%",
                            width: "100%",
                            overflow: "auto",
                            position: "relative",
                        }}
                    >
                        <Table
                            sx={{
                                position: "relative",
                                width: "100%",
                                tableLayout: "fixed",
                            }}
                            aria-label="simple table"
                            stickyHeader
                        >
                            <TableHead
                                sx={{ background: "white", zIndex: 9999 }}
                            >
                                <TableRow
                                    sx={{ background: "white", zIndex: 9999 }}
                                >
                                    <TableCell width="45%">
                                        {lange("Name")}
                                    </TableCell>
                                    {Object.keys(PERMISSION_LEVELS)
                                        .sort(
                                            (p1, p2) =>
                                                PERMISSION_LEVELS[p2].level -
                                                PERMISSION_LEVELS[p1].level
                                        )
                                        .map((permissionLevel) => (
                                            <TableCell
                                                key={permissionLevel}
                                                width="10%"
                                                align="center"
                                            >
                                                <Box>
                                                    {
                                                        PERMISSION_LEVELS[
                                                            permissionLevel
                                                        ].icon
                                                    }
                                                    <Typography variant="body2">
                                                        {lange(
                                                            PERMISSION_LEVELS[
                                                                permissionLevel
                                                            ].name
                                                        )}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <File
                                    dataroomId={dataroomId}
                                    index={"1"}
                                    groupId={groupId}
                                    notification={notification}
                                    onPermissionUpdate={
                                        handlePermissionChangeCallback
                                    }
                                    visible={true}
                                />
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {groupId && isMobile && (
                    <FileMobileView
                        dataroomId={dataroomId}
                        groupId={groupId}
                    />
                )}

                {!groupLoading && filteredGroups?.length == 0 && (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                    >
                        <ErrorPage
                            severity="warning"
                            message="No groups are found for file permission control"
                        />
                    </Box>
                )}
                {groupLoading && (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                    >
                        <CircularProgress />
                    </Box>
                )}
                {groupError && (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                    >
                        <ErrorPage
                            severity="error"
                            message="Unable to fetch groups at the moment."
                        />
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default PermissionsPage;
