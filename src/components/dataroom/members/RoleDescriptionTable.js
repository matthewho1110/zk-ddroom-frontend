import { ROLES } from "../../../configs/roleConfig";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Box,
    IconButton,
    TableContainer,
} from "@mui/material";

import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

const RoleDescriptionTable = ({
    roles,
    onClick,
    selectedInviteeIndex,
    onReturn,
}) => {
    return (
        <Box>
            <Box display="flex" justifyContent="end">
                <IconButton onClick={onReturn}>
                    {" "}
                    <KeyboardReturnIcon />
                </IconButton>
            </Box>
            <TableContainer sx={{ height: "60vh", overflow: "auto" }}>
                <Table aria-label="simple table" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Role</TableCell>
                            <TableCell>Manage Files</TableCell>
                            <TableCell>Upload Files</TableCell>
                            <TableCell>Manage Users</TableCell>
                            <TableCell>Manage Groups</TableCell>
                            <TableCell>Manage Events</TableCell>

                            <TableCell>Manage Settings</TableCell>
                            <TableCell>View Analytics</TableCell>
                            <TableCell>Viewable By</TableCell>
                            <TableCell>Active Phases</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roles.map((role) => {
                            const roleDescription = ROLES[role];
                            return (
                                <TableRow
                                    key={role}
                                    sx={{
                                        "&:hover": {
                                            backgroundColor:
                                                "rgba(0, 0, 0, 0.04)",
                                        },
                                        cursor: "pointer",
                                    }}
                                    onClick={() => onClick(role)}
                                >
                                    <TableCell>{role}</TableCell>
                                    <TableCell>
                                        {roleDescription?.isFileManager ? (
                                            <DoneIcon color="primary" />
                                        ) : (
                                            <CloseIcon color="error" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {roleDescription?.canUploadFiles ? (
                                            <DoneIcon color="primary" />
                                        ) : (
                                            <CloseIcon color="error" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {roleDescription?.canManageUsers ? (
                                            <DoneIcon color="primary" />
                                        ) : (
                                            <CloseIcon color="error" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {roleDescription?.canManageGroups ? (
                                            <DoneIcon color="primary" />
                                        ) : (
                                            <CloseIcon color="error" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {roleDescription?.canManageEvents ? (
                                            <DoneIcon color="primary" />
                                        ) : (
                                            <CloseIcon color="error" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {roleDescription?.canManageSettings ? (
                                            <DoneIcon color="primary" />
                                        ) : (
                                            <CloseIcon color="error" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {roleDescription?.canViewAnalytics ? (
                                            <DoneIcon color="primary" />
                                        ) : (
                                            <CloseIcon color="error" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {roleDescription?.viewableByDescription}
                                    </TableCell>
                                    <TableCell>
                                        {roleDescription?.activePhases.join(
                                            ", "
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default RoleDescriptionTable;
