// external imports
import { memo, useState } from "react";

// mui imports
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import Logout from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Settings from "@mui/icons-material/Settings";
import { Box, Button, Link, Stack, Modal } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Icon } from "@iconify/react";
import TransferWithinAStationIcon from "@mui/icons-material/TransferWithinAStation";

// own imports
import useAlert from "../../hooks/useAlert";
import { useRouter } from "next/router";
import useUser from "../../hooks/useUser";
import useUserProfileQuery from "../../hooks/useUserProfile";
import DisguiseModal from "./DisguiseModal";
import ChatBot from "@components/chatBot/ChatBot";
import LangaugeSelect from "@components/LangaugeSelect";
import lange from "@i18n";

function UserTopBar(props) {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState(null);
    const { logout } = useUser();
    const { axiosInstance } = useUser();
    const { setAlert } = useAlert();
    const { data } = useUserProfileQuery();
    const [disguiseModalOpen, setDisguiseModalOpen] = useState(false);

    const openDisguiseModal = () => {
        setDisguiseModalOpen(true);
    };

    const onClose = () => {
        setDisguiseModalOpen(false);
    };

    const handleAvatarClick = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleAvatarClose = (e) => {
        setAnchorEl(null);
    };

    const clearDisguise = async () => {
        try {
            await axiosInstance.delete(`/user/disguise`);
            localStorage.removeItem("disguiseId");
            window.location = "/datarooms";
            setAlert(
                "You have turned off disguise mode successfully.",
                "success"
            );
        } catch (error) {
            setAlert("Something went wrong. Please try again later.", "error");
        }
    };

    return (
        <Box
            width="100%"
            boxShadow={3}
            backgroundColor="white"
            zIndex={1300}
            top={0}
            display="flex"
            p={"15px 20px"}
            position="fixed"
            justifyContent="space-between"
        >
            <Link href="/datarooms">
                <img
                    src="/images/logo.png"
                    alt="logo"
                    height={40}
                    width="auto"
                    style={{
                        width: "auto",
                    }}
                />
            </Link>
            <Stack
                display="flex"
                alignItems="center"
                direction="row"
                spacing={5}
            >
                {localStorage.getItem("disguiseId") && (
                    <Typography
                        variant="h6"
                        className="link-btn"
                        onClick={clearDisguise}
                    >
                        Clear Disguise
                    </Typography>
                )}
                <LangaugeSelect reloadCB={props.onReload} />
                {/* <IconButton onClick={() => {}}>
                    <NotificationsIcon />
                </IconButton>
                <IconButton onClick={() => {}}>
                    <Settings />
                </IconButton> */}
                <Tooltip title="Account settings">
                    <IconButton
                        onClick={handleAvatarClick}
                        size="medium"
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        sx={{ padding: 0 }}
                    >
                        <Avatar
                            sx={{
                                backgroundColor: "#1e253a",
                                color: "white",
                                height: 40,
                                width: 40,
                            }}
                        >
                            {data?.firstname.charAt(0)}
                        </Avatar>
                    </IconButton>
                </Tooltip>
            </Stack>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={anchorEl !== null}
                onClose={handleAvatarClose}
                onClick={handleAvatarClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        minWidth: 200,
                        "& .MuiAvatar-root": {
                            width: 20,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        "&:before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 28,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                <Box px={2} py="6px">
                    {data && (
                        <Stack direction="column" spacing={1}>
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="flex-end"
                            >
                                <Typography variant="h3">
                                    {data?.firstname + " " + data?.lastname}
                                </Typography>
                                <Typography variant="h6">
                                    ({data?.organization})
                                </Typography>
                            </Stack>
                            <Typography color="neutral.dark">
                                {data?.email}
                            </Typography>
                        </Stack>
                    )}
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem component="a" href="/user/profile">
                    <ListItemIcon>
                        <Icon icon="iconamoon:profile-fill" width="18px" />
                    </ListItemIcon>
                    {lange("Profile")}
                </MenuItem>
                <Divider />
                <MenuItem component="a" href="/securitySettings">
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    {lange("Security_Settings")}
                </MenuItem>
                {data?.platform_role == "Super Admin" && (
                    <MenuItem component="a" onClick={openDisguiseModal}>
                        <ListItemIcon>
                            <TransferWithinAStationIcon fontSize="small" />
                        </ListItemIcon>
                        {lange("Disguise")}
                    </MenuItem>
                )}
                {/* <MenuItem>
                    <ListItemIcon>
                        <AccountBalanceWalletIcon fontSize="small" />
                    </ListItemIcon>
                    Billing
                </MenuItem> */}
                <Divider />
                <MenuItem
                    onClick={() => {
                        setAlert(
                            "You have been logged out successfully",
                            "success"
                        );
                        logout();
                    }}
                >
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    {lange("Logout")}
                </MenuItem>
            </Menu>

            <DisguiseModal
                open={disguiseModalOpen}
                onClose={() => setDisguiseModalOpen(false)}
            />
        </Box>
    );
}

export default memo(UserTopBar);
