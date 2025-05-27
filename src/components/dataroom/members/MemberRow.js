import {
    Avatar,
    Box,
    FormControl,
    IconButton,
    Menu,
    MenuItem,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";

import GroupsDropdown from "../../reusableComponents/dataroom/GroupsDropdown";
import RolesDropdown from "../../reusableComponents/dataroom/RolesDropdown";

// Custom Configs
import { ROLES } from "../../../configs/roleConfig";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import { useState, memo } from "react";

import useAlert from "../../../hooks/useAlert";

import lange from "@i18n";

import { formatPhoneNumberIntl } from "react-phone-number-input";

const ITEM_HEIGHT = 48;

const MemberRow = ({
    isMe,
    member,
    myRole,
    onActionClick,
    onGroupChange,
    onRoleChange,
    groups = [],
}) => {
    // Custom hooks
    const { setAlert } = useAlert();
    const [anchorEl, setAnchorEl] = useState(null);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const open = Boolean(anchorEl);

    // Member role
    const memberLevel = ROLES[member.role]?.level;

    // User details
    const user = member.user;

    // My role and permissions
    const myLevel = myRole?.level;
    const manageable =
        myRole?.canManageUsers &&
        myLevel > memberLevel &&
        ROLES[member.role]?.virtualRole != true;
    const canViewAnalytics = myRole?.canViewAnalytics;
    const canEditGroup = myRole?.canManageGroups;
    const showGroups = myRole?.canViewGroups;
    const showRoles = myRole?.canViewRoles;

    let availableActions = [
        ...(manageable ? ["Remove_User"] : []),
        ...(canViewAnalytics ? ["Access_Report"] : []),
        ...(!member.active ? ["Resend_Invitation"] : []),
    ];

    const showOptions = (e) => {
        e.preventDefault();
        setAnchorEl(e.currentTarget);
        setMenuPosition({ top: e.clientY, left: e.clientX });
    };

    const handleClick = (e) => {
        setAnchorEl(e.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <TableRow
            key={member._id}
            sx={{
                "& td": {
                    borderTop: "1px solid #f5f5f5",
                },
                backgroundColor: isMe ? "#f5f5f5" : "white",

                "&:hover": {
                    backgroundColor: "#f5f5f5",
                },
                cursor: "pointer",
            }}
            onContextMenu={(e) => {
                showOptions(e);
            }}
            onClick={() => {
                /*
        setState((prevState) => {
            return {
                ...prevState,
                index:
                    prevState.index +
                    "." +
                    i,
            };
        });*/
            }}
        >
            <TableCell align="left" width="15%">
                <Box
                    whiteSpace="no-wrap"
                    display="flex"
                    flexDirection="row"
                    justifyContent="flex-start"
                    alignItems="center"
                >
                    {user?.status == "Verifying" ? (
                        <>{lange("Unregistered", "User")}</>
                    ) : (
                        <>
                            <Avatar
                                variant="square"
                                sx={{
                                    width: 25,
                                    height: 25,
                                    marginRight: "1rem",
                                }}
                            ></Avatar>
                            {user?.firstname + " " + user?.lastname}
                        </>
                    )}
                </Box>
            </TableCell>
            <TableCell align="left" width="10%">
                {user?.status == "Verifying" ? "N/A" : user?.organization}
            </TableCell>
            <TableCell
                align="left"
                width="20%"
                sx={{
                    maxWidth: 120,
                    overflowX: "auto",
                }}
            >
                {user?.email}
            </TableCell>
            <TableCell align="left" width="10%">
                {user?.status == "Verifying"
                    ? "N/A"
                    : formatPhoneNumberIntl(user?.phone) || user?.phone}
            </TableCell>
            {showRoles == true && (
                <TableCell align="left" width="18%">
                    {manageable == false && (
                        <Typography>{member.role}</Typography>
                    )}

                    {manageable == true &&
                        (showRoleDropdown ? (
                            <RolesDropdown
                                onSelect={(role) => {
                                    setShowRoleDropdown(false);
                                    if (role != member.role) {
                                        onRoleChange(member._id, role);
                                    }
                                }}
                                selectedRole={member.role}
                                roles={
                                    // Only show roles that are lower or equal than the current user's role
                                    Object.keys(ROLES).filter((role) => {
                                        return (
                                            ROLES[role].level <= myLevel &&
                                            ROLES[role].virtualRole == false
                                        );
                                    })
                                }
                                sx={{ width: "80%" }}
                            />
                        ) : (
                            <Box>
                                {member.role}{" "}
                                {
                                    <IconButton
                                        onClick={() =>
                                            setShowRoleDropdown(true)
                                        }
                                        size="small"
                                    >
                                        <EditIcon fontSize="inherit" />
                                    </IconButton>
                                }
                            </Box>
                        ))}
                </TableCell>
            )}
            {showGroups == true && (
                <TableCell align="left" width="17%">
                    {canEditGroup != true && (
                        <Typography>{member.group.name}</Typography>
                    )}

                    {canEditGroup == true &&
                        (showGroupDropdown ? (
                            <GroupsDropdown
                                selectedGroups={[member.group._id]}
                                onSelect={(groupId) => {
                                    if (groupId != member.group._id) {
                                        onGroupChange(member._id, groupId);
                                    }
                                    setShowGroupDropdown(false);
                                }}
                                groups={groups || []}
                                sx={{ width: "80%" }}
                            />
                        ) : (
                            <Box>
                                {member.group?.name}{" "}
                                {
                                    <IconButton
                                        onClick={() =>
                                            setShowGroupDropdown(true)
                                        }
                                        size="small"
                                    >
                                        <EditIcon fontSize="inherit" />
                                    </IconButton>
                                }
                            </Box>
                        ))}
                </TableCell>
            )}{" "}
            <TableCell align="left" width="5%">
                <Typography>
                    {member.active ? lange("Active") : lange("Inactive")}
                </Typography>
            </TableCell>
            <TableCell align="left" width="5%">
                {availableActions.length > 0 && (
                    <>
                        <IconButton
                            aria-label="action"
                            id="action-button"
                            aria-controls={open ? "long-menu" : undefined}
                            aria-expanded={open ? "true" : undefined}
                            aria-haspopup="true"
                            onClick={showOptions}
                            size="s"
                        >
                            <MoreHorizIcon fontSize="inherit" />
                        </IconButton>

                        <Menu
                            id="action-menu"
                            MenuListProps={{
                                "aria-labelledby": "action-button",
                            }}
                            anchorEl={anchorEl}
                            anchorReference="anchorPosition"
                            anchorPosition={{
                                top: menuPosition.top,
                                left: menuPosition.left,
                            }}
                            open={open}
                            onClose={handleClose}
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
                            {availableActions.map((option) => (
                                <MenuItem
                                    key={option}
                                    onClick={() => {
                                        handleClose();
                                        onActionClick(member._id, option);
                                    }}
                                >
                                    {lange(option)}
                                </MenuItem>
                            ))}
                        </Menu>
                    </>
                )}
            </TableCell>
        </TableRow>
    );
};
export default memo(MemberRow);
