import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";

import Menu from "./menu/Menu";

import UserTopBar from "./userTopBar/UserTopBar";

import useUser from "../hooks/useUser";

import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import Drawer from "@mui/material/Drawer";
import SubjectIcon from "@mui/icons-material/Subject";
import { isDesktop, isMobile } from "react-device-detect";
import { Box, Typography } from "@mui/material";
import getRouters from "../configs/routes/routes";

import ErrorPage from "./reusableComponents/ErrorPage";

import useSWR from "swr";
import useUserProfileQuery from "@hooks/useUserProfile";
import useUserAPI from "@hooks/useUserAPI";
import SecuritySettings from "./settings/SecuritySettings";
import useConfirmationDialog from "@hooks/useConfirmationDialog";
import { Chat } from "@mui/icons-material";
import ChatBot from "./chatBot/ChatBot";

const drawerWidth = 250;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: isMobile ? 0 : `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: isMobile ? 0 : `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerContent = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
    }),
}));

function ComponentWrapper({ children, title, onReload }) {
    const router = useRouter();
    const { isLoggedIn, axiosInstance } = useUser();
    const { setConfirmationDialog } = useConfirmationDialog();
    const { did } = router.query;
    const [scrolled, setScrolled] = useState(false);
    const [menuCollapsed, setMenuCollapsed] = useState(false);
    const [open, setOpen] = useState(!isMobile);
    const routers = getRouters(did);

    const { data: user } = useSWR(isLoggedIn ? "/user/profile" : null, (url) =>
        axiosInstance.get(url).then((res) => res.data)
    );

    let currentRouter = {};
    routers.forEach((res) => {
        if (res.pathname === router.pathname) {
            currentRouter = res;
        }
        if (res.child) {
            currentRouter = res.child.find(
                (item) => item.pathname === router.pathname
            );
        }
    });
    const onPreLoginPages = [
        "/login",
        "/",
        "/registration",
        "/resetPassword",
        "/wechatFileViewer",
    ].includes(router.route);

    const onDataroomPages = router.route.includes("/dataroom");

    const showMenu = isLoggedIn && onDataroomPages && did && !menuCollapsed;

    const showTopBar = isLoggedIn;

    const needLoginFirst = isLoggedIn == false && !onPreLoginPages;

    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const { data: dataroomData } = useSWR(
        did && isLoggedIn == true ? `/datarooms/${did}` : null,
        fetcher
    );

    const [isChatOpen, setIsChatOpen] = useState(false);
    const handleChatBotOpen = useCallback((check) => {
        setIsChatOpen(check);
    }, []);

    const showChatbot = isLoggedIn && onDataroomPages && did && isChatOpen;

    const { getEnabledAuthenticators } = useUserAPI();
    const { data: authenticators } = getEnabledAuthenticators();
    const notActiveMember = dataroomData && !dataroomData.active;
    const isSuperAdmin = user?.platform_role === "Super Admin";

    const superAdminNotEnabled2FA =
        isSuperAdmin && !!authenticators && !Object.keys(authenticators).length;

    useEffect(() => {
        if (needLoginFirst && router.isReady) {
            router.push(`/login?redirectUrl=${router.asPath}`);
            return;
        }
        if (
            isSuperAdmin &&
            superAdminNotEnabled2FA &&
            process.env.ENV != "development"
        ) {
            router.push(`/securitySettings`);
            setConfirmationDialog({
                title: "Super Admin Compliance",
                description:
                    "You need to enable at least one authenticator to be able to access the admin functions.",
                onConfirm: () => {},
            });
            return;
        }

        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 90) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        setIsChatOpen(dataroomData?.chatOpen);
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [router.isReady, needLoginFirst, superAdminNotEnabled2FA, dataroomData]);
    // If accessing a dataroom page without being logged in, redirect to login page

    // if (!onPreLoginPages && !isDesktop) {
    //     return (
    //         <Box>=
    //             <ErrorPage
    //                 message={
    //                     "Only desktop version is available at the momenet. Please stayed tuned for the mobile app"
    //                 }
    //             />
    //         </Box>
    //     );
    // } else
    if (isLoggedIn == null || needLoginFirst || notActiveMember) {
        // If loading login status / need login first / not active member, show nothing
        return <></>;
    } else if (isSuperAdmin && !isDesktop && process.env.ENV != "development") {
        return (
            <Box>
                <ErrorPage
                    message={
                        "Admin account is not allowed to access ddroom on the mobile app. Please use the desktop version."
                    }
                />
            </Box>
        );
    } else {
        return (
            <Box sx={{ display: "flex", width: "100%", overflowX: "hidden" }}>
                {showTopBar && (
                    <UserTopBar
                        scrolled={scrolled}
                        languageChange
                        onReload={() => onReload()}
                    />
                )}
                {isMobile && showMenu && (
                    <Box
                        position="fixed"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        direction="row"
                        zIndex={1200}
                        sx={{
                            top: 70,
                            padding: "20px",
                            left: 0,
                            right: 0,
                            backgroundColor: "#fff",
                        }}
                    >
                        <SubjectIcon
                            fontSize="large"
                            onClick={() => setOpen(true)}
                        />
                        <Typography
                            variant="h1"
                            noWrap
                            fontSize="18px"
                            component="div"
                            align="center"
                            flex={1}
                            fontWeight={600}
                        >
                            {title ? title : currentRouter?.name}
                        </Typography>
                    </Box>
                )}
                {showMenu &&
                    (!isMobile ? (
                        <DrawerContent variant="permanent" open={open}>
                            <Menu
                                dataroomId={did}
                                open={open}
                                scrolled={scrolled}
                                languageChange
                                handleChatBotOpen={handleChatBotOpen}
                                onCollapse={() => setOpen(!open)}
                            />
                        </DrawerContent>
                    ) : (
                        <Drawer
                            open={open}
                            anchor={"left"}
                            sx={{
                                width: drawerWidth,
                                flexShrink: 0,
                                "& .MuiDrawer-paper": {
                                    width: drawerWidth,
                                    boxSizing: "border-box",
                                },
                            }}
                            onClose={() => setOpen(!open)}
                        >
                            <Menu
                                dataroomId={did}
                                languageChange
                                open={open}
                                scrolled={scrolled}
                                onCollapse={() => setOpen(!open)}
                            />
                        </Drawer>
                    ))}

                <Box
                    // ml={showMenu ? "280px" : 0}
                    component="main"
                    sx={{
                        flexGrow: 1,
                        marginTop: showTopBar
                            ? isMobile
                                ? showMenu
                                    ? "140px"
                                    : "80px"
                                : "20px"
                            : 0,
                        padding: showTopBar
                            ? isMobile
                                ? "0 20px"
                                : "40px 24px 0 24px"
                            : 0,
                        width: isMobile ? "100%" : "auto",
                        overflowX: "auto",
                    }}
                >
                    {children}
                </Box>
                {showChatbot && <ChatBot dataroomId={did} />}
            </Box>
        );
    }
}

export default ComponentWrapper;
