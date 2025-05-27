import {
    Box,
    Stack,
    Button,
    Checkbox,
    CircularProgress,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";

import useDataroom from "../../../hooks/useDataroom";

import styled from "@emotion/styled";

import axios from "axios";
import { useEffect, useState } from "react";
import useAlert from "../../../hooks/useAlert";
import useUser from "../../../hooks/useUser";
import { useQuery } from "@tanstack/react-query";

// custom hooks
import useConfirmationDialog from "../../../hooks/useConfirmationDialog";
import { isMobile } from "react-device-detect";

const INITAL_STATE = {
    question: "",
    answer: "",
};

function EditFAQForm({
    status,
    dataroomId,
    faq,
    onAddSuccess,
    onEditSuccess,
    onDeleteSuccess,
}) {
    // hooks
    const { setConfirmationDialog } = useConfirmationDialog();
    const [state, setState] = useState({
        ...INITAL_STATE,
        question: faq?.question || "",
        answer: faq?.answer || "",
    });

    const editDisabled = ["EDIT", "ADD"].includes(status) == false;
    const { axiosInstance } = useUser();
    const { setAlert, alertHandler } = useAlert();

    const handleDeleteFAQ = async () => {
        try {
            await axiosInstance.delete(
                `${process.env.BACKEND_URI}/datarooms/${dataroomId}/faqs/${faq._id}`
            );
            setAlert("FAQ deleted successfully", "success");
            onDeleteSuccess();
        } catch (err) {
            alertHandler(err, {});
        }
    };

    const handleChangeQuestion = (e) => {
        setState((prevState) => ({ ...prevState, question: e.target.value }));
    };

    const handleChangeAnswer = (e) => {
        setState((prevState) => ({
            ...prevState,
            answer: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!faq?._id) {
                // create new FAQ
                const newFAQ = (
                    await axiosInstance.post(
                        `${process.env.BACKEND_URI}/datarooms/${dataroomId}/faqs`,
                        state
                    )
                ).data;

                onAddSuccess();
                // console.log(newFAQ);
                setAlert("FAQ created successfully", "success");
            } else {
                // update FAQ
                const updatedFAQ = (
                    await axiosInstance.patch(
                        `${process.env.BACKEND_URI}/datarooms/${dataroomId}/faqs/${faq._id}`,
                        state
                    )
                ).data;
                onEditSuccess();
                setAlert("FAQ updated successfully", "success");
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status == 400) {
                    setAlert(err.response.data.message, "error");
                    return;
                } else if (err.response.status == 403) {
                    setAlert("You are not authorized to do this", "warning");
                    return;
                }
            }
            setAlert("Unknown System Error", "error");
            console.log(err);
        }
    };

    return (
        <Box
            margin="10vh auto"
            width={isMobile ? "80%" : "30%"}
            p={2}
            borderRadius={2}
            backgroundColor="white"
            display="flex"
            flexDirection="column"
            component="form"
            onSubmit={handleSubmit}
        >
            <Typography variant="h4" sx={{ mb: 4 }}>
                {status == "VIEW" && "FAQ"}
                {status == "EDIT" && "Edit FAQ"}
                {status == "ADD" && "Add New FAQ"}
            </Typography>

            <Box display="flex" flexDirection="column" gap={2} height="100%">
                <TextField
                    fullWidth
                    label="FAQ Question"
                    variant="outlined"
                    size="small"
                    name="question"
                    required
                    value={state.question}
                    onChange={handleChangeQuestion}
                    disabled={editDisabled}
                />
                <TextField
                    fullWidth
                    required
                    label="FAQ Answer"
                    variant="outlined"
                    size="small"
                    name="answer"
                    multiline
                    rows={4}
                    value={state.answer}
                    onChange={handleChangeAnswer}
                    disabled={editDisabled}
                />
            </Box>
            {editDisabled == false && (
                <Stack
                    width="100%"
                    alignItems="flex-end"
                    justifyContent="center"
                    marginTop={2}
                    spacing={1}
                >
                    {true ? (
                        <Button
                            variant="contained"
                            fullWidth
                            type="submit"
                            sx={{ typography: "body2" }}
                        >
                            {faq?._id ? "Save" : "Add"}
                        </Button>
                    ) : (
                        <CircularProgress size={28} />
                    )}
                    {
                        // if group is not null, then we are editing an existing group
                        faq?._id && (
                            <Button
                                variant="contained"
                                fullWidth
                                color="error"
                                sx={{ typography: "body2" }}
                                onClick={() => {
                                    setConfirmationDialog({
                                        title: "Delete FAQ",
                                        description:
                                            "Are you sure you want to delete this FAQ?",
                                        onConfirm: handleDeleteFAQ,
                                        onCancel: () => {},
                                    });
                                }}
                            >
                                Delete FAQ
                            </Button>
                        )
                    }
                </Stack>
            )}
        </Box>
    );
}

export default EditFAQForm;
