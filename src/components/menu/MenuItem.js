import {
    ListItemButton,
    ListItemIcon,
    Typography,
    ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/router";
import { ROLES } from "../../configs/roleConfig";
import { useEffect } from "react";
import { isMobile } from "react-device-detect";

const MenuItem = ({ role, item, onCollapse, menuOpen, onOpenMenu }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(item.path);
        { !menuOpen && onOpenMenu && onOpenMenu() }
        isMobile && onCollapse()
    };
    const isCurrentPath = router.pathname == item.pathname;

    if (
        item.path &&
        (!item.requiredPermission ||
            (role && ROLES[role][item.requiredPermission]))
    ) {
        return (
            <ListItemButton
                onClick={handleClick}
                sx={{
                    paddingY: "5px",
                    paddingX: "18px",
                    color: "white",
                    backgroundColor: isCurrentPath
                        ? "primary.dark"
                        : "primary.main",

                    "&:hover": {
                        backgroundColor: "primary.dark",
                    },
                }}
            >
                {(item.icon || menuOpen) && <ListItemIcon sx={{ color: "white", minWidth: isMobile ? "36px" : "56px" }}>{item.icon}</ListItemIcon>}
                <ListItemText>
                    <Typography variant="h6">{item.name}</Typography>
                </ListItemText>
            </ListItemButton>
        );
    } else {
        return null;
    }
};

export default MenuItem;
