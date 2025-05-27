import {
    Typography,
    TableCell,
    TableRow,
    Skeleton,
    IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import useUser from "../../../../../hooks/useUser";
import AccessReportModal from "./UserAccessReportModal";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";

const Record = ({
    dataroomId,
    group,
    member,
    visible,
    startTime,
    endTime,
    fileId,
    canViewMore = false,
}) => {
    const { axiosInstance } = useUser();
    const [userStats, setUserStats] = useState(null);
    const [members, setMembers] = useState([]);
    const [collapsed, setCollapsed] = useState(false);
    const [membersFetched, setMembersFetched] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const hasMembers = members?.length > 0;

    const fetchMembers = async () => {
        try {
            const response = await axiosInstance.get(
                `datarooms/${dataroomId}/members`,
                {
                    params: {
                        group: group._id,
                    },
                }
            );
            setMembers(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleClick = () => {
        if (!group) {
            return;
        }
        if (!collapsed && !membersFetched) {
            setMembersFetched(true);
        }
        setCollapsed(!collapsed);
    };
    const fetchUserStats = async () => {
        try {
            const response = await axiosInstance.get(
                `datarooms/${dataroomId}/userStats`,
                {
                    params: {
                        ...(group
                            ? { userGroupId: group._id }
                            : { userId: member.user._id }),
                        fields: ["viewTime", "downloads"],
                        startTime: startTime,
                        endTime: endTime,
                        fileId: fileId,
                    },
                }
            );

            setUserStats({
                viewTime:
                    Math.round(
                        response.data.results?.[0]?.viewTime / 1000 / 60
                    ) || 0,
                downloads: response.data.results?.[0]?.downloads || 0,
            });
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        if (dataroomId && (group || member) && !(group && member)) {
            fetchUserStats();
            if (group) {
                fetchMembers();
            }
        }
    }, [dataroomId, group, member, startTime, endTime]);

    if (visible) {
        return (
            <>
                <TableRow
                    onClick={handleClick}
                    sx={{
                        cursor: "pointer",
                        "&:hover": {
                            backgroundColor: "var(--light-gray)",
                        },
                    }}
                >
                    <TableCell
                        className="onAppearAnimated"
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        {userStats && (
                            <>
                                {group && (
                                    <Typography>
                                        {hasMembers && (
                                            <span>
                                                {collapsed ? "▼" : "▶"}
                                                &nbsp;&nbsp;
                                            </span>
                                        )}
                                        {group.name || "Untitled Group"}
                                    </Typography>
                                )}
                                {member && (
                                    <Typography sx={{ pl: 2 }}>
                                        {(member.user.status == "Active"
                                            ? member.user.firstname +
                                              " " +
                                              member.user.lastname
                                            : member.user.email) || "N/A"}
                                    </Typography>
                                )}

                                {canViewMore && (
                                    <IconButton
                                        sx={{
                                            ml: 1,
                                            p: 0,
                                            "&:hover": {
                                                backgroundColor: "transparent",
                                            },
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setReportModalOpen(true);
                                        }}
                                    >
                                        <ZoomInRoundedIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </>
                        )}
                        {!userStats && <Skeleton width="60%" />}
                    </TableCell>
                    <TableCell className="onAppearAnimated">
                        {userStats && userStats.viewTime}
                        {!userStats && <Skeleton width="60%" />}
                    </TableCell>
                    <TableCell className="onAppearAnimated">
                        {userStats && userStats.downloads}
                        {!userStats && <Skeleton width="60%" />}
                    </TableCell>
                </TableRow>
                {membersFetched &&
                    members?.map((member) => {
                        return (
                            <Record
                                visible={collapsed}
                                dataroomId={dataroomId}
                                member={member}
                                startTime={startTime}
                                endTime={endTime}
                                fileId={fileId}
                                canViewMore={canViewMore}
                            />
                        );
                    })}
            </>
        );
    }
    return null;
};

export default Record;
