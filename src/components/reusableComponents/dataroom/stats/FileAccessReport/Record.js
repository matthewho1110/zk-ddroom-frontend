import {
    Box,
    CircularProgress,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import { useState, memo, useEffect } from "react";
import useUser from "../../../../../hooks/useUser";
import lange from "@i18n";

const Record = ({
    depth,
    dataroomId,
    fileId,
    visible,
    startTime,
    endTime,
    userId,
    canViewMore = false,
}) => {
    const { axiosInstance } = useUser();
    const [fileStats, setFileStats] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [childrenFetched, setChildrenFetched] = useState(false);
    const hasChildren = fileStats?.children?.length > 0;

    const fetchFileStats = async () => {
        try {
            let params = {};
            if (fileId) {
                params.fileId = fileId;
            } else {
                params.path = "/root";
            }

            const response = await axiosInstance.get(
                `datarooms/${dataroomId}/fileStats`,
                {
                    params: {
                        ...(fileId ? { fileId } : { path: "/root" }),
                        fields: ["viewTime", "downloads", "distinctViewers"],
                        startTime,
                        userId,
                        endTime: endTime ? endTime + 24 * 60 * 60 * 1000 : null,
                    },
                }
            );

            setFileStats({
                name: response.data.name,
                children: response.data.children,
                viewTime:
                    Math.round(
                        response.data.results?.[0]?.viewTime / 1000 / 60
                    ) || 0,
                distinctViewers:
                    response.data.results?.[0]?.distinctViewers || 0,

                downloads: response.data.results?.[0]?.downloads || 0,
            });
        } catch (err) {
            console.log(err);
        }
    };
    const handleClick = (e) => {
        if (!collapsed && !childrenFetched) {
            setChildrenFetched(true);
        }
        setCollapsed(!collapsed);
    };
    useEffect(() => {
        if (dataroomId) {
            fetchFileStats();
        }
    }, [dataroomId, fileId, startTime, endTime]);

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
                        {fileStats && (
                            <Typography sx={{ pl: depth * 2 }}>
                                {hasChildren && (
                                    <span>
                                        {collapsed ? "▼" : "▶"}&nbsp;&nbsp;
                                    </span>
                                )}

                                {(fileStats?.name == "root"
                                    ? lange("All_Folder")
                                    : fileStats?.name) || "Untitled File"}
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
                        {!fileStats && <Skeleton width="60%" />}
                    </TableCell>
                    {!userId && (
                        <TableCell className="onAppearAnimated">
                            {fileStats && fileStats.distinctViewers}
                            {!fileStats && <Skeleton width="60%" />}
                        </TableCell>
                    )}
                    <TableCell className="onAppearAnimated">
                        {fileStats && fileStats.viewTime}
                        {!fileStats && <Skeleton width="60%" />}
                    </TableCell>
                    <TableCell className="onAppearAnimated">
                        {fileStats && fileStats.downloads}
                        {!fileStats && <Skeleton width="60%" />}
                    </TableCell>
                </TableRow>
                {childrenFetched &&
                    fileStats?.children?.map((file) => (
                        <Record
                            key={file._id}
                            depth={depth + 1}
                            dataroomId={dataroomId}
                            userId={userId}
                            fileId={file._id}
                            visible={collapsed}
                            startTime={startTime}
                            endTime={endTime}
                        />
                    ))}
            </>
        );
    } else {
        return null;
    }
};

export default memo(Record);
