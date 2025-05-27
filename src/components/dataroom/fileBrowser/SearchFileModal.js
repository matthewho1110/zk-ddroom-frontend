import styled from "@emotion/styled";
import {
    InputAdornment,
    TextField,
    Modal,
    Paper,
    Button,
    Box,
} from "@mui/material";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FileList from "./FileList";
import useUser from "../../../hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import useAlert from "../../../hooks/useAlert";

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

function SearchFileModal({
    dataroomId,
    open,
    onClose,
    onFileClick,
    onFileDelete,
}) {
    const [filter, setFilter] = useState("");
    const [files, setFiles] = useState([]);
    const { logout, axiosInstance } = useUser();
    const { setAlert, alertHandler } = useAlert();

    const searchFiles = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await axiosInstance.get(
                `datarooms/${dataroomId}/files/search?keyword=${filter}`
            );

            setFiles(response.data);
        } catch (err) {
            alertHandler(err);
            if (err.response?.status === 401) {
                logout();
            } else {
                setFiles([]);
            }
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Paper
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "80vw",
                    height: "80vh",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                }}
                component="form"
                onSubmit={searchFiles}
            >
                <Box display="flex" mb={2}>
                    <FileFilter
                        value={filter}
                        InputLabelProps={{
                            shrink: true,
                            style: { display: "none" },
                        }}
                        placeholder="Search File name"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        onChange={(event) => {
                            setFilter(event.target.value);
                        }}
                        name="filter"
                        style={{ marginRight: "1rem" }}
                    />
                    <Button variant="contained" type="submit">
                        Search
                    </Button>
                </Box>

                <FileList
                    files={files}
                    onFileClick={(path) => {
                        onFileClick(path);
                        onClose();
                    }}
                    onFileDelete={onFileDelete}
                    showDirectory={true}
                    uploadDisabled={true}
                    actionDisabled={true}
                    selectDisabled={true}
                />
            </Paper>
        </Modal>
    );
}

export default SearchFileModal;
