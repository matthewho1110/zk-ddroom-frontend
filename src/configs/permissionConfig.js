import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import DownloadIcon from "@mui/icons-material/Download";
import SecurityUpdateIcon from "@mui/icons-material/SecurityUpdate";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import lange from "@i18n";

module.exports.DATAROOM_PERMISSIONS = {
    // "canManageAdmin",
    // "canManageUsers",
    canManageEvents: {
        name: "Manage Events",
    },
    canViewAnalytics: {
        name: "View Analytics",
    },
    canManageFAQ: {
        name: "Manage FAQ",
    },
    canManageQNA: {
        name: "Manage Q & A",
    },
    canViewMembers: {
        name: "View Members",
    },
};

// Permission Levels Mapping
module.exports.PERMISSION_LEVELS = {
    none: {
        level: 0,
        name: "None",
        icon: <CloseIcon />,
        inheritIcon: (
            <CloseIcon sx={{ color: "error.main", filter: "opacity(25%)" }} />
        ),
        activeIcon: <CloseIcon sx={{ color: "error.main" }} />,
        hiddenIcon: <CloseIcon sx={{ color: "neutral.main" }} />,
        availableActions: [],
    },
    view: {
        level: 1,
        name: "View",
        icon: <VisibilityIcon />,
        inheritIcon: (
            <DoneIcon sx={{ color: "primary.main", filter: "opacity(25%)" }} />
        ),
        activeIcon: <DoneIcon sx={{ color: "primary.main" }} />,
        hiddenIcon: <DoneIcon sx={{ color: "neutral.main" }} />,
        availableActions: ["View"],
    },
    downloadEncrypted: {
        level: 2,
        name: "Download_Protected",
        icon: <SecurityUpdateIcon />,
        inheritIcon: (
            <DoneIcon sx={{ color: "primary.main", filter: "opacity(25%)" }} />
        ),
        activeIcon: <DoneIcon sx={{ color: "primary.main" }} />,
        hiddenIcon: <DoneIcon sx={{ color: "neutral.main" }} />,
        availableActions: ["View"],
    },
    downloadPDF: {
        level: 3,
        name: "Download_PDF",
        icon: <SimCardDownloadIcon />,
        inheritIcon: (
            <DoneIcon sx={{ color: "primary.main", filter: "opacity(25%)" }} />
        ),
        activeIcon: <DoneIcon sx={{ color: "primary.main" }} />,
        hiddenIcon: <DoneIcon sx={{ color: "neutral.main" }} />,
        availableActions: ["View"],
    },
    downloadOriginal: {
        level: 4,
        name: "Download_Original",
        icon: <DownloadIcon />,
        inheritIcon: (
            <DoneIcon sx={{ color: "primary.main", filter: "opacity(25%)" }} />
        ),
        activeIcon: <DoneIcon sx={{ color: "primary.main" }} />,
        hiddenIcon: <DoneIcon sx={{ color: "neutral.main" }} />,
        availableActions: ["View"],
    },
    edit: {
        level: 5,
        name: "Edit",
        icon: <EditIcon />,
        inheritIcon: (
            <DoneIcon sx={{ color: "primary.main", filter: "opacity(25%)" }} />
        ),
        activeIcon: <DoneIcon sx={{ color: "primary.main" }} />,
        hiddenIcon: <DoneIcon sx={{ color: "neutral.main" }} />,
        availableActions: [
            "View",
            "Move",
            "Rename",
            "Delete",
            "Upload",
            "Reindex",
            "Download",
            "Access_Report",
            "Resend_Alert",
        ],
    },
};
