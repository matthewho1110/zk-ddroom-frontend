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
// import FileRow from "@reusableComponents/dataroom/stats/fileView/FileRow";
// import lange from "@i18n";

// const DocumentView = ({ dataroomId, includeAdmin, startTime, endTime }) => {
//     return (
//         <Box>
//             <Box display="flex" width="100%">
//                 <Button variant="contained" sx={{ ml: "auto" }} disabled>
//                     {" "}
//                     {lange("Export_To_Csv")}
//                 </Button>
//             </Box>
//             <Typography variant="h5" textAlign="center">
//                 Document View
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
//                         }}
//                     >
//                         <TableHead
//                             sx={{
//                                 fontSize: 36,
//                                 top: 0,
//                                 right: 0,
//                             }}
//                         >
//                             <TableRow>
//                                 <TableCell width="55%"></TableCell>
//                                 <TableCell with="15%">
//                                     {lange("Users_Viewed")}
//                                 </TableCell>
//                                 <TableCell with="15%">
//                                     {lange("Viewing_Time") +
//                                         " (" +
//                                         lange("In_Minutes") +
//                                         ")"}
//                                 </TableCell>
//                                 <TableCell width="15%">
//                                     {lange("Download")}
//                                 </TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody
//                             sx={{
//                                 overflow: "auto",
//                                 height: "100%",
//                             }}
//                         >
//                             <FileRow
//                                 depth={0}
//                                 dataroomId={dataroomId}
//                                 visible={true}
//                                 includeAdmin={includeAdmin}
//                                 startTime={startTime}
//                                 endTime={endTime}
//                             />
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </Box>
//         </Box>
//     );
// };

// export default memo(DocumentView);
