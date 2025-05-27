import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import QuizIcon from "@mui/icons-material/Quiz";
import RestoreIcon from "@mui/icons-material/Restore";
import SettingsIcon from "@mui/icons-material/Settings";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

import lange from '@i18n';

module.exports = function (dataroomId, permissions) {
    return [
        {
            id: 1,
            path: `/dataroom/${dataroomId}/dashboard`,
            pathname: "/dataroom/[did]/dashboard",
            name: lange("Dashboard"),
            icon: <DashboardIcon />,
            requiredPermission: "canViewAnalytics",
        },
        {
            id: 2,
            path: `/dataroom/${dataroomId}/files`,
            pathname: "/dataroom/[did]/files",
            name: lange("Documents"),
            icon: <FolderCopyIcon />,
            child: [
                {
                    id: 3,
                    path: `/dataroom/${dataroomId}/files?filePath=${encodeURIComponent(
                        "/root"
                    )}`,
                    pathname: "/dataroom/[did]/files",
                    name: lange("File_Browser"),
                },
                {
                    id: 4,
                    path: `/dataroom/${dataroomId}/files/permissions`,
                    pathname: "/dataroom/[did]/files/permissions",
                    name: lange("Permissions"),
                    requiredPermission: "isFileManager",
                },
            ],
        },
        // {
        //     id: 5,
        //     path: `/dataroom/${dataroomId}/analytics`,
        //     name: "Analytics",
        //     icon: <AnalyticsIcon />,
        //     child: [
        //         {
        //             id: 6,
        //             path: `/dataroom/${dataroomId}/analytics/lineChart`,
        //             name: "Visit Count",
        //         },
        //         {
        //             id: 7,
        //             path: `/dataroom/${dataroomId}/analytics/barChart`,
        //             name: "Active Users",
        //         },
        //         {
        //             id: 86,
        //             path: `/dataroom/${dataroomId}/analytics/pieChart`,
        //             name: "View Distribution",
        //         },
        //         {
        //             id: 79,
        //             path: `/dataroom/${dataroomId}/analytics/geographyChart`,
        //             name: "Member Geographical Distribution",
        //         },
        //     ],
        // },
        // {
        //     id: 6,
        //     path: `/dataroom/${dataroomId}/events`,
        //     name: "Events",
        //     icon: <EventNoteIcon />,
        // },

        {
            id: 7,
            path: `/dataroom/${dataroomId}/history`,
            pathname: "/dataroom/[did]/history",
            name: lange("User_Activities"),
            icon: <RestoreIcon />,
            requiredPermission: "canViewAnalytics",
        },
        {
            id: 8,
            path: `/dataroom/${dataroomId}/members`,
            pathname: "/dataroom/[did]/members",
            name: lange("Users"),
            icon: <PeopleAltIcon />,
        },
        {
            id: 7,
            path: `/dataroom/${dataroomId}/faq`,
            pathname: "/dataroom/[did]/faq",
            name: lange("FAQ"),
            icon: <QuizIcon />,
        },
        {
            id: 8,
            path: `/dataroom/${dataroomId}/qa/list`,
            pathname: "/dataroom/[did]/qa/list",
            name: "QA",
            icon: <ChatBubbleIcon />,
        },
        {
            id: 9,
            path: `/dataroom/${dataroomId}/setting`,
            pathname: "/dataroom/[did]/setting",
            name: lange("Setting"),
            icon: <SettingsIcon />,
            requiredPermission: "canManageSettings",
        },
    ];
};
