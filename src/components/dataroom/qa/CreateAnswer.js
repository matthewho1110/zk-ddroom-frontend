import React, { useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { Box, Alert, Stack } from "@mui/material";
import useQuestionAPI from "./useQuestionAPI";

export default function AskQuestion(props) {
    const { did, qid, setQuestion } = props;
    const [errMessage, setErrMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [resubmitted, setResubmitted] = useState(false);
    const [newAnswer, setNewAnswer] = useState({ answer: "" });
    const [errors, setErrors] = useState({ answer: "" });
    const questionAPI = useQuestionAPI();

    const validInput = () => {
        let validInput = true;

        if (newAnswer.answer.length < 5 || newAnswer.answer.length > 500) {
            errors.answer =
                "Answer text must be minimum 5 and maximum 500 characters long";
            validInput = false;
        }

        if (validInput) {
            return true;
        } else {
            setErrors({ ...errors });
            return false;
        }
    };

    const createAnswer = async () => {
        try {
            setSubmitted(true);
            await questionAPI.answerQuestion(did, qid, newAnswer.answer);
            const data = await questionAPI.getQuestionDetail(did, qid);
            setQuestion(data);
        } catch (error) {
            console.log(error.message);
            setErrMessage(error.message);
        } finally {
            setSubmitted(false);
            setResubmitted(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (submitted) {
            setResubmitted(true);
            return;
        }
        setErrMessage("");
        if (validInput()) {
            createAnswer();
        } else {
            console.log("Answer did not create");
        }
    };

    const handleChange = (event) => {
        setNewAnswer({ ...newAnswer, [event.target.name]: event.target.value });
        setErrors({ answer: "" });
        setErrMessage("");
    };

    return (
        <>
            <CssBaseline />

            {errMessage && (
                <Stack sx={{ width: "100%" }} spacing={2}>
                    <Alert severity="error">{errMessage}</Alert>
                </Stack>
            )}
            {resubmitted && (
                <Stack sx={{ width: "100%" }} spacing={2}>
                    <Alert severity="error">Please don't resubmitted!</Alert>
                </Stack>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="answer"
                    label="Answer"
                    name="answer"
                    value={newAnswer.answer}
                    onChange={handleChange}
                    error={errors.answer ? true : false}
                    helperText={errors.answer}
                />
                <Button type="submit" variant="contained" sx={{ mb: 2 }}>
                    Submit Answer
                </Button>
            </Box>
        </>
    );
}
