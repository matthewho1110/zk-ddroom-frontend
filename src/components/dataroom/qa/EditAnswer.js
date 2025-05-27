import React, { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { Box, Alert, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import useAnswerAPI from "../utils/useAnswerAPI";
import useLocalStorageHook from "../utils/useLocalStorageHook";
import { useHistory } from "react-router-dom";
import { isMobile } from "react-device-detect";

export default function EditAnswer() {
    const [errMessage, setErrMessage] = useState("");
    const [answer, setAnswer] = useState({});
    const [question, setQuestion] = useState({});
    const [errors, setErrors] = useState({ answer: "" });
    const answerAPI = useAnswerAPI();
    const local = useLocalStorageHook();
    const history = useHistory();

    useEffect(() => {
        setAnswer(local.getCurrentAnswerObject());
        setQuestion(local.getCurrentQuestionObject());
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const validInput = () => {
        let validInput = true;

        if (answer.answer.length < 5 || answer.answer.length > 500) {
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

    const editAnswer = async () => {
        try {
            await answerAPI.updateAnswer(answer);
            history.push("/question-page");
        } catch (error) {
            console.log(error.message);
            setErrMessage(error.message);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrMessage("");
        if (validInput()) {
            editAnswer();
        } else {
            console.log("Answer was not edited");
        }
    };

    const handleChange = (event) => {
        setAnswer({ ...answer, [event.target.name]: event.target.value });
        setErrors({ answer: "" });
        setErrMessage("");
    };

    return (
        <Container maxWidth="md">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Typography component="h6" variant="h6">
                    {question.question}
                </Typography>
                <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                    <QuestionAnswerIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Edit Answer
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
                    sx={{ mt: 1, width: "100%" }}
                >
                    <TextField
                        multiline
                        maxRows={5}
                        required
                        fullWidth
                        name="answer"
                        value={answer.answer}
                        onChange={handleChange}
                        label="Answer"
                        type="text"
                        id="answer"
                        error={errors.answer ? true : false}
                        helperText={errors.answer}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Edit Answer
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
