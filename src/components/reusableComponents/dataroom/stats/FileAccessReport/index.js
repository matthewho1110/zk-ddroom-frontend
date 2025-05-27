import styled from "@emotion/styled";
import {
    TextField,
    Modal,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Typography,
} from "@mui/material";
import lange from "@i18n";
import Record from "./Record";
import { isMobile } from "react-device-detect";

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

function FileAccessReport({
    dataroomId,
    startTime,
    endTime,
    user,
    canViewMore = false,
}) {
    return (
        <Box>
            <TableContainer
                sx={{
                    height: "70vh",
                }}
            >
                <Table
                    sx={{
                        tableLayout: "fixed",
                    }}
                    stickyHeader
                >
                    <TableHead>
                        <TableRow>
                            <TableCell width={!user && isMobile ? "40%" : "55%"}></TableCell>
                            {!user && (
                                <TableCell with="10%">
                                    {lange("Users_Viewed")}
                                </TableCell>
                            )}
                            <TableCell with="30%">
                                {lange("View_Time") + "(" + lange("In_Minutes") + ")"}
                            </TableCell>
                            <TableCell width="20%">
                                {lange("Download")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody
                        sx={{
                            overflow: "auto",
                            height: "100%",
                        }}
                    >
                        <Record
                            depth={0}
                            dataroomId={dataroomId}
                            visible={true}
                            userId={user?._id}
                            startTime={startTime}
                            endTime={endTime}
                            canViewMore={canViewMore}
                        />
                    </TableBody>
                </Table>
            </TableContainer>
        </Box >
    );
}

export default FileAccessReport;
