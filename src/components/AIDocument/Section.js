// import external modules
import { memo, useEffect, useState } from "react";
import {
    Box,
    Divider,
    Button,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";

function Section() {
    return (
        <>
            <TextField sx={{ marginTop: "10px" }} value={"haha"} />
            <p style={{ fontSize: "10px" }}>
                # AI will generate the content based on the section description
            </p>
            <TextField value={"lorem ipsum"} />
        </>
    );
}

export default memo(Section);
