import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import { Alert, Box, Button, Collapse, Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import useQuestionAPI from "./useQuestionAPI";

export default function CommentCard(props) {
    const { expend, answer, setQuestion } = props;
    const [newComment, setNewComment] = useState({ comment: "" });
    const [errMessage, setErrMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [resubmitted, setResubmitted] = useState(false);
    const [errors, setErrors] = useState({ comment: "" });
    const questionAPI = useQuestionAPI();

    const validInput = () => {
        let validInput = true;

        if (newComment.comment.length < 5 || newComment.comment.length > 500) {
            errors.comment =
                "Comment text must be minimum 5 and maximum 500 characters long";
            validInput = false;
        }

        if (validInput) {
            return true;
        } else {
            setErrors({ ...errors });
            return false;
        }
    };

    const createComment = async () => {
        try {
            setSubmitted(true);
            await questionAPI.commentAnswer(
                answer.dataroomId,
                answer._id,
                newComment.comment
            );
            const data = await questionAPI.getQuestionDetail(
                answer.dataroomId,
                answer.questionId
            );
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
            createComment();
        } else {
            console.log("Answer did not create");
        }
    };
    const handleChange = (event) => {
        setNewComment({
            ...newComment,
            [event.target.name]: event.target.value,
        });
        setErrors({ comment: "" });
    };

    return (
        <Collapse in={expend} timeout="auto" unmountOnExit>
            <Box
                sx={{ marginLeft: 10, marginTop: 1, maxWidth: 700 }}
                component="form"
                onSubmit={handleSubmit}
                noValidate
            >
                {answer.comments.map((comment, index) => {
                    return (
                        <Typography
                            key={index}
                            variant="body2"
                            color="text.secondary"
                        >
                            {comment.commentUser.firstname}:{comment.comment}
                        </Typography>
                    );
                })}

                {errMessage && (
                    <Stack sx={{ width: "100%" }} spacing={2}>
                        <Alert severity="error">{errMessage}</Alert>
                    </Stack>
                )}
                {resubmitted && (
                    <Stack sx={{ width: "100%" }} spacing={2}>
                        <Alert severity="error">
                            Please don't resubmitted!
                        </Alert>
                    </Stack>
                )}

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="comment"
                    label="Comment"
                    name="comment"
                    value={newComment.comment}
                    onChange={handleChange}
                    error={!!errors.comment}
                    helperText={errors.comment}
                />
                <Button type="submit" variant="text" sx={{ mb: 2 }}>
                    submit comment
                </Button>
            </Box>
        </Collapse>
    );
}
