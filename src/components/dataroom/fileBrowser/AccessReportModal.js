// import styled from "@emotion/styled";
// import {
//     InputAdornment,
//     TextField,
//     Modal,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Paper,
//     Button,
//     Box,
//     Typography,
//     Divider,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import useSWR from "swr";
// import useUser from "../../../hooks/useUser";
// import lange from "@i18n";
// import UserRow from "../../reusableComponents/dataroom/stats/userView/UserRow";

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

// function AccessReportModal({ dataroomId, open, onClose, file }) {
//     const { axiosInstance } = useUser();

//     const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

//     const { data: groups } = useSWR(
//         dataroomId ? `/datarooms/${dataroomId}/groups` : null,
//         fetcher
//     );
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
//                     {file?.name + "'s "} {lange("Access_Report")}
//                 </Typography>
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
//                         stickyHeader
//                     >
//                         <TableHead>
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
//                             {groups?.length == 0 && <UserRow visible={true} />}
//                             {groups?.map((group) => {
//                                 return (
//                                     <UserRow
//                                         dataroomId={dataroomId}
//                                         group={group}
//                                         visible={true}
//                                         fileId={file?._id}
//                                     />
//                                 );
//                             })}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </Box>
//         </Modal>
//     );
// }

// export default AccessReportModal;
