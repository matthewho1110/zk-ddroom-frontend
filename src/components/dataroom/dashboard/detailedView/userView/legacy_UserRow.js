// import {
//     Box,
//     Typography,
//     Table,
//     TableHead,
//     TableBody,
//     TableCell,
//     TableRow,
//     CircularProgress,
//     Skeleton,
// } from "@mui/material";
// import { useEffect, useState } from "react";
// import useUser from "../../../../../hooks/useUser";

// const UserRow = ({
//     dataroomId,
//     group,
//     member,
//     visible,
//     startTime,
//     endTime,
// }) => {
//     const { axiosInstance } = useUser();
//     const [userStats, setUserStats] = useState(null);
//     const [members, setMembers] = useState([]);
//     const [collapsed, setCollapsed] = useState(false);
//     const [membersFetched, setMembersFetched] = useState(false);
//     const hasMembers = members?.length > 0;

//     const fetchMembers = async () => {
//         try {
//             const response = await axiosInstance.get(
//                 `datarooms/${dataroomId}/members`,
//                 {
//                     params: {
//                         group: group._id,
//                     },
//                 }
//             );
//             setMembers(response.data);
//             console.log(response.data);
//         } catch (err) {
//             console.log(err);
//         }
//     };

//     const handleClick = () => {
//         if (!group) {
//             return;
//         }
//         if (!collapsed && !membersFetched) {
//             setMembersFetched(true);
//         }
//         setCollapsed(!collapsed);
//     };
//     const fetchUserStats = async () => {
//         try {
//             const response = await axiosInstance.get(
//                 `datarooms/${dataroomId}/userStats`,
//                 {
//                     params: {
//                         ...(group
//                             ? { userGroupId: group._id }
//                             : { userId: member.uid }),
//                         fields: ["viewTime", "downloads"],
//                         startTime: startTime,
//                         endTime: endTime,
//                     },
//                 }
//             );

//             console.log(
//                 Math.round(response.data.results?.[0]?.viewTime / 1000 / 60)
//             );

//             setUserStats({
//                 viewTime:
//                     Math.round(
//                         response.data.results?.[0]?.viewTime / 1000 / 60
//                     ) || 0,
//                 downloads: response.data.results?.[0]?.downloads || 0,
//             });

//             console.log(response.data);
//         } catch (err) {
//             console.log(err);
//         }
//     };
//     useEffect(() => {
//         if (dataroomId && (group || member) && !(group && member)) {
//             fetchUserStats();
//             if (group) {
//                 fetchMembers();
//             }
//         }
//     }, [dataroomId, group, member, startTime, endTime]);

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
//                         {userStats && (
//                             <>
//                                 {group && (
//                                     <Typography>
//                                         {hasMembers && (
//                                             <span>
//                                                 {collapsed ? "▼" : "▶"}
//                                                 &nbsp;&nbsp;
//                                             </span>
//                                         )}
//                                         {group.name || "Untitled Group"}
//                                     </Typography>
//                                 )}
//                                 {member && (
//                                     <Typography sx={{ pl: 2 }}>
//                                         {(member.status == "Active"
//                                             ? member.firstname +
//                                               " " +
//                                               member.lastname
//                                             : member.email) || "N/A"}
//                                     </Typography>
//                                 )}
//                             </>
//                         )}
//                         {!userStats && <Skeleton width="60%" />}
//                     </TableCell>
//                     <TableCell className="onAppearAnimated">
//                         {userStats && userStats.viewTime}
//                         {!userStats && <Skeleton width="60%" />}
//                     </TableCell>
//                     <TableCell className="onAppearAnimated">
//                         {userStats && userStats.downloads}
//                         {!userStats && <Skeleton width="60%" />}
//                     </TableCell>
//                 </TableRow>
//                 {membersFetched &&
//                     members?.map((member) => {
//                         return (
//                             <UserRow
//                                 visible={collapsed}
//                                 dataroomId={dataroomId}
//                                 member={member}
//                                 startTime={startTime}
//                                 endTime={endTime}
//                             />
//                         );
//                     })}
//             </>
//         );
//     }
//     return null;
// };

// export default UserRow;
