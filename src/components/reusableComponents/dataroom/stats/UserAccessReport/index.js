import styled from "@emotion/styled";
import {
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
} from "@mui/material";
import useSWR from "swr";
import useUser from "../../../../../hooks/useUser";
import lange from "@i18n";
import Record from "./Record";
import { isMobile } from "react-device-detect";

const FileFilter = styled(TextField)({
    width: "100%",
    "& .MuiInputBase-root.MuiOutlinedInput-root": {
        padding: "6px 16px",
        height: "100%",
    },
    "& .MuiInputBase-input.MuiOutlinedInput-input": {
        lineHeight: 1.75,
        padding: 0,
    },
    "& .MuiInput-input.MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "rgb(0, 0, 0)", // (default alpha is 0.38)
    },
});

function UserAccessReport({
    dataroomId,
    file,
    startTime,
    endTime,
    canViewMore = false,
}) {
    const { axiosInstance } = useUser();

    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

    const { data: groups } = useSWR(
        dataroomId ? `/datarooms/${dataroomId}/groups` : null,
        fetcher
    );
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
                        overflow: "auto",
                    }}
                    stickyHeader
                >
                    <TableHead>
                        <TableRow>
                            <TableCell width={isMobile ? "40%" : "60%"}></TableCell>
                            <TableCell width={isMobile ? "40%" : "20%"}>
                                {lange("View_Time") + "(" + lange("In_Minutes") + ")"}
                            </TableCell>
                            <TableCell width="20%">
                                {lange("Download")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groups?.length == 0 && <UserRow visible={true} />}
                        {groups?.map((group) => {
                            return (
                                <Record
                                    dataroomId={dataroomId}
                                    group={group}
                                    visible={true}
                                    fileId={file?._id}
                                    startTime={startTime}
                                    endTime={endTime}
                                    canViewMore={canViewMore}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default UserAccessReport;
