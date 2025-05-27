import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { Box, Alert, Stack, Grid } from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import useQuestionAPI from "./useQuestionAPI";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/router";

export default function AskQuestion({ onClose, onSuccess }) {
    const [errMessage, setErrMessage] = useState("");
    const [newQuestion, setNewQuestion] = useState({
        title: "",
        content: "",
        category: "",
    });
    const [errors, setErrors] = useState({
        title: "",
        content: "",
        category: "",
    });
    const questionAPI = useQuestionAPI();
    const router = useRouter();
    const { did } = router.query;

    const validInput = () => {
        let validInput = true;
        if (newQuestion.title.length < 5 || newQuestion.title.length > 50) {
            errors.title =
                "Question title must be minimum 5 and maximum 50 characters long";
            validInput = false;
        }

        if (
            newQuestion.content.length < 5 ||
            newQuestion.content.length > 500
        ) {
            errors.content =
                "Question text must be minimum 5 and maximum 500 characters long";
            validInput = false;
        }
        if (newQuestion.category.length < 1) {
            errors.category = "Question category should not be empty";
            validInput = false;
        }

        if (validInput) {
            return true;
        } else {
            setErrors({ ...errors });
            return false;
        }
    };

    const createQuestion = () => {
        try {
            questionAPI.createQuestion(newQuestion, did);
        } catch (error) {
            setErrMessage(error.message);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrMessage("");
        if (validInput()) {
            createQuestion();
            onSuccess();
        } else {
            console.log("Question did not create");
        }
    };

    const handleChange = (event) => {
        setNewQuestion({
            ...newQuestion,
            [event.target.name]: event.target.value,
        });
        setErrors({ title: "", question: "", category: "" });
        setErrMessage("");
    };

    return (
        <Box
            margin="10vh auto"
            width="30%"
            p={2}
            borderRadius={2}
            backgroundColor="white"
            display="flex"
            flexDirection="column"
        >
            <Typography component="h1" variant="h5">
                Ask Question
            </Typography>
            {errMessage && (
                <Stack sx={{ width: "100%" }} spacing={2}>
                    <Alert severity="error">{errMessage}</Alert>
                </Stack>
            )}

            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ mt: 1 }}
            >
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="title"
                    label="Title"
                    name="title"
                    value={newQuestion.title}
                    onChange={handleChange}
                    error={errors.title ? true : false}
                    helperText={errors.title}
                    autoFocus
                />
                <TextField
                    margin="normal"
                    multiline
                    maxRows={5}
                    required
                    fullWidth
                    name="content"
                    value={newQuestion.content}
                    onChange={handleChange}
                    label="Content"
                    type="text"
                    id="content"
                    error={errors.content ? true : false}
                    helperText={errors.content}
                />
                <TextField
                    margin="normal"
                    select
                    required
                    fullWidth
                    name="category"
                    value={newQuestion.category}
                    onChange={handleChange}
                    label="Category"
                    type="text"
                    id="category"
                    error={errors.category ? true : false}
                    helperText={errors.category}
                >
                    <MenuItem value={"Bug"}>Bug</MenuItem>
                    <MenuItem value={"Issue"}>Issue</MenuItem>
                    <MenuItem value={"Feature"}>Feature</MenuItem>
                    <MenuItem value={"Suggestion"}>Suggestion</MenuItem>
                </TextField>
                <Grid
                    container
                    width="100%"
                    alignItems="flex-end"
                    justifyContent="flex-end"
                    marginTop={2}
                    spacing={1}
                >
                    <Button
                        variant="contained"
                        color="neutral"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button variant="contained" type="submit" sx={{ ml: 1 }}>
                        Create
                    </Button>
                </Grid>
            </Box>
        </Box>
    );
}
