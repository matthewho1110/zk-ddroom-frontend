import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import {
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import colorConfig from "../../configs/colorConfig";
import MenuItem from "./MenuItem";
import { ROLES } from "../../configs/roleConfig";
import { useRouter } from "next/router";

import Menu from "@mui/material/Menu";
import { isMobile } from "react-device-detect";

const Root = styled(ListItemButton)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    "&:hover": {
        backgroundColor: theme.palette.primary.dark,
    },
}));

const CollapseMenuItem = ({
    role,
    changeActiveTab,
    item,
    menuOpen,
    onCollapse,
}) => {
    const router = useRouter();
    const root = useRef(null);

    const onChildPath = item.child?.some((child) => {
        return child.pathname == router.pathname;
    });

    const [open, setOpen] = useState(onChildPath);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        if (!menuOpen) {
            setAnchorEl(root.current);
            setTimeout(() => {
                setOpen(false);
            }, 0);
        } else {
            setOpen(onChildPath);
        }
    }, [menuOpen]);

    const handleOpen = (event) => {
        setOpen(!open);
        !menuOpen && setAnchorEl(event.currentTarget);
    };

    if (
        !item.requiredPermission ||
        (role && ROLES[role][item.requiredPermission] == true)
    ) {
        return (
            <>
                <Root
                    id="basic-button"
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleOpen}
                    ref={root}
                    sx={{
                        paddingY: "5px",
                        paddingX: "18px",
                        backgroundColor:
                            onChildPath && !open
                                ? "primary.dark"
                                : "primary.main",

                        "&:hover": {
                            backgroundColor: "primary.dark",
                        },
                    }}
                >
                    <ListItemIcon
                        sx={{
                            color: "white",
                            minWidth: isMobile ? "36px" : "56px",
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="h6">{item.name}</Typography>
                    </ListItemText>
                    {open ? (
                        <ExpandLessOutlinedIcon />
                    ) : (
                        <ExpandMoreOutlinedIcon />
                    )}
                </Root>
                {!menuOpen ? (
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}
                        open={open}
                        onClose={() => {
                            setOpen(!open);
                        }}
                        MenuListProps={{
                            "aria-labelledby": "basic-button",
                        }}
                        PaperProps={{
                            sx: {
                                "& .MuiList-root ": {
                                    padding: 0,
                                },
                            },
                        }}
                    >
                        {item.child?.map((route, index) =>
                            route.child ? (
                                <CollapseMenuItem
                                    changeActiveTab={changeActiveTab}
                                    item={route}
                                    key={index}
                                    onCollapse={onCollapse}
                                    onOpenMenu={() => {
                                        setOpen(!open);
                                    }}
                                    menuOpen={menuOpen}
                                    role={role}
                                />
                            ) : (
                                <MenuItem
                                    changeActiveTab={changeActiveTab}
                                    item={route}
                                    menuOpen={menuOpen}
                                    onOpenMenu={() => {
                                        setOpen(!open);
                                    }}
                                    onCollapse={onCollapse}
                                    key={index}
                                    role={role}
                                />
                            )
                        )}
                    </Menu>
                ) : (
                    <Collapse in={open} timeout="auto">
                        <List
                            sx={{
                                padding: 0,
                            }}
                        >
                            {item.child?.map((route, index) =>
                                route.child ? (
                                    <CollapseMenuItem
                                        changeActiveTab={changeActiveTab}
                                        item={route}
                                        menuOpen={menuOpen}
                                        key={index}
                                        onCollapse={onCollapse}
                                        role={role}
                                    />
                                ) : (
                                    <MenuItem
                                        changeActiveTab={changeActiveTab}
                                        item={route}
                                        menuOpen={menuOpen}
                                        key={index}
                                        onCollapse={onCollapse}
                                        role={role}
                                    />
                                )
                            )}
                        </List>
                    </Collapse>
                )}
            </>
        );
    } else {
        return null;
    }
};

export default CollapseMenuItem;
