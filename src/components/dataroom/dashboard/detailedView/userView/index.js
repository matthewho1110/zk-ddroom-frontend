// import {
//     Box,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Typography,
//     Button,
// } from "@mui/material";
// import { memo, useState, useEffect } from "react";
// import useUser from "../../../../../hooks/useUser";
// import UserRow from "@reusableComponents/dataroom/stats/userView/UserRow";
// import lange from "@i18n";

// const UserView = ({ dataroomId, includeAdmin, startTime, endTime, fileId }) => {
//     const [groups, setGroups] = useState([]);
//     const { axiosInstance } = useUser();
//     const fetchGroups = async () => {
//         try {
//             const response = await axiosInstance.get(
//                 `datarooms/${dataroomId}/groups`,
//                 {
//                     params: {
//                         includeAdmin: includeAdmin,
//                     },
//                 }
//             );

//             setGroups(response.data);
//             console.log(response.data);
//         } catch (err) {
//             console.log(err);
//         }
//     };

//     useEffect(() => {
//         if (dataroomId) {
//             fetchGroups();
//         }
//     }, [dataroomId, includeAdmin]);
//     return (
//         <Box>
//             <Box display="flex" width="100%">
//                 <Button variant="contained" sx={{ ml: "auto" }} disabled>
//                     {" "}
//                     {lange("Export_To_Csv")}
//                 </Button>
//             </Box>
//             <Typography variant="h5" textAlign="center">
//                 {lange("Group_View")}
//             </Typography>
//             <Box
//                 sx={{
//                     marginTop: "1.5rem",
//                 }}
//             >
//                 <TableContainer
//                     sx={{
//                         height: "70vh",
//                     }}
//                 >
//                     <Table
//                         sx={{
//                             tableLayout: "fixed",
//                             overflow: "auto",
//                         }}
//                     >
//                         <TableHead sx={{ fontSize: 36 }}>
//                             <TableRow>
//                                 <TableCell width="60%"></TableCell>
//                                 <TableCell with="20%">
//                                     {lange("Viewing_Time") +
//                                         " (" +
//                                         lange("In_Minutes") +
//                                         ")"}
//                                 </TableCell>
//                                 <TableCell width="20%">
//                                     {lange("Download")}
//                                 </TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {groups.length == 0 && <UserRow visible={true} />}
//                             {groups.map((group) => {
//                                 return (
//                                     <UserRow
//                                         dataroomId={dataroomId}
//                                         group={group}
//                                         visible={true}
//                                         startTime={startTime}
//                                         endTime={endTime}
//                                     />
//                                 );
//                             })}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </Box>
//         </Box>
//     );
// };

// export default memo(UserView);
