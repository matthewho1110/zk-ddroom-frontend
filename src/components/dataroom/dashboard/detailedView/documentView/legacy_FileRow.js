// import {
//     Box,
//     CircularProgress,
//     Skeleton,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Typography,
// } from "@mui/material";

// import { useState, memo, useEffect } from "react";
// import useUser from "../../../../../hooks/useUser";

// const FileRow = ({
//     depth,
//     dataroomId,
//     fileId,
//     visible,
//     startTime,
//     endTime,
//     includeAdmin = false,
// }) => {
//     const { axiosInstance } = useUser();
//     const [fileStats, setFileStats] = useState(null);
//     const [collapsed, setCollapsed] = useState(false);
//     const [childrenFetched, setChildrenFetched] = useState(false);

//     const hasChildren = fileStats?.children?.length > 0;

//     const fetchFileStats = async () => {
//         try {
//             let params = {};
//             if (fileId) {
//                 params.fileId = fileId;
//             } else {
//                 params.path = "/root";
//             }

//             const response = await axiosInstance.get(
//                 `datarooms/${dataroomId}/fileStats`,
//                 {
//                     params: {
//                         ...(fileId ? { fileId } : { path: "/root" }),
//                         fields: ["viewTime", "downloads", "distinctViewers"],
//                         includeAdmin,
//                         startTime,
//                         endTime: endTime ? endTime + 24 * 60 * 60 * 1000 : null,
//                     },
//                 }
//             );
//             console.log(response);
//             setFileStats({
//                 name: response.data.name,
//                 children: response.data.children,
//                 viewTime:
//                     Math.round(
//                         response.data.results?.[0]?.viewTime / 1000 / 60
//                     ) || 0,
//                 distinctViewers:
//                     response.data.results?.[0]?.distinctViewers || 0,

//                 downloads: response.data.results?.[0]?.downloads || 0,
//             });
//             console.log(response.data);
//         } catch (err) {
//             console.log(err);
//         }
//     };
//     const handleClick = (e) => {
//         if (!collapsed && !childrenFetched) {
//             setChildrenFetched(true);
//         }
//         setCollapsed(!collapsed);
//     };
//     useEffect(() => {
//         if (dataroomId) {
//             fetchFileStats();
//         }
//     }, [dataroomId, fileId, includeAdmin, startTime, endTime]);

//     if (visible) {
//         return (
//             <>
//                 <TableRow
//                     onClick={handleClick}
//                     sx={{
//                         cursor: "pointer",
//                         "&:hover": {
//                             backgroundColor: "var(--light-gray)",
//                         },
//                     }}
//                 >
//                     <TableCell className="onAppearAnimated">
//                         {fileStats && (
//                             <Typography sx={{ pl: depth * 2 }}>
//                                 {hasChildren && (
//                                     <span>
//                                         {collapsed ? "▼" : "▶"}&nbsp;&nbsp;
//                                     </span>
//                                 )}

//                                 {fileStats?.name || "Untitled File"}
//                             </Typography>
//                         )}
//                         {!fileStats && <Skeleton width="60%" />}
//                     </TableCell>
//                     <TableCell className="onAppearAnimated">
//                         {fileStats && fileStats.distinctViewers}
//                         {!fileStats && <Skeleton width="60%" />}
//                     </TableCell>
//                     <TableCell className="onAppearAnimated">
//                         {fileStats && fileStats.viewTime}
//                         {!fileStats && <Skeleton width="60%" />}
//                     </TableCell>
//                     <TableCell className="onAppearAnimated">
//                         {fileStats && fileStats.downloads}
//                         {!fileStats && <Skeleton width="60%" />}
//                     </TableCell>
//                 </TableRow>
//                 {childrenFetched &&
//                     fileStats?.children?.map((file) => (
//                         <FileRow
//                             depth={depth + 1}
//                             dataroomId={dataroomId}
//                             fileId={file._id}
//                             visible={collapsed}
//                             includeAdmin={includeAdmin}
//                             startTime={startTime}
//                             endTime={endTime}
//                         />
//                     ))}
//             </>
//         );
//     } else {
//         return null;
//     }
// };

// export default memo(FileRow);
