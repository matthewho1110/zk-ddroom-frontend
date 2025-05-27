// import styled from "@emotion/styled";
// import {
//     TextField,
//     Modal,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Box,
//     Typography,
// } from "@mui/material";
// import lange from "@i18n";
// import FileRow from "../../reusableComponents/dataroom/stats/fileView/FileRow";

// const FileFilter = styled(TextField)({
//     width: "100%",
//     "& .MuiInputBase-root.MuiOutlinedInput-root": {
//         padding: "6px 16px",
//         height: "100%",
//     },
//     "& .MuiInputBase-input.MuiOutlinedInput-input": {
//         lineHeight: 1.75,
//         padding: 0,
//     },
//     "& .MuiInput-input.MuiInputBase-input.Mui-disabled": {
//         WebkitTextFillColor: "rgb(0, 0, 0)", // (default alpha is 0.38)
//     },
// });

// function AccessReportModal({ dataroomId, open, onClose, user }) {
//     return (
//         <Modal open={open} onClose={onClose}>
//             <Box
//                 sx={{
//                     marginTop: 5,
//                     background: "white",
//                     width: "80%",
//                     mx: "auto",
//                     borderRadius: 2,
//                 }}
//             >
//                 <Typography sx={{ py: 2 }} variant="h3" textAlign="center">
//                     {user?.email + "'s "}
//                     {lange("Access_Report")}
//                 </Typography>
//                 <TableContainer
//                     sx={{
//                         height: "70vh",
//                     }}
//                 >
//                     <Table
//                         sx={{
//                             tableLayout: "fixed",
//                         }}
//                         stickyHeader
//                     >
//                         <TableHead>
//                             <TableRow>
//                                 <TableCell width="55%"></TableCell>
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
//                                 userId={user?._id}
//                             />
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </Box>
//         </Modal>
//     );
// }

// export default AccessReportModal;
