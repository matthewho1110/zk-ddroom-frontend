import React, { useState, useEffect, useRef } from "react";
import Typography from "@mui/material/Typography";
import {
    Box,
    Button,
    Chip,
    Stack,
    TextField,
    InputAdornment,
    IconButton,
    Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReplyIcon from "@mui/icons-material/Reply";
import useQuestionAPI from "./useQuestionAPI";
import { useRouter } from "next/router";
import useAlert from "../../../hooks/useAlert";
import useUserProfileQuery from "../../../hooks/useUserProfile";
import dayjs from "dayjs";
import { isMobile } from "react-device-detect";
import lange from "@i18n";
import dynamic from "next/dynamic";
const QuestionForm = dynamic(import("./QuestionForm"), { ssr: false });
import Question from "./Question";

export default function QuestionPage({ did, qid }) {
    const [question, setQuestion] = useState({});
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [comment, setComment] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const questionAPI = useQuestionAPI();
    const router = useRouter();
    const { setAlert } = useAlert();
    // Get user data from useUserProfile
    const { data: user } = useUserProfileQuery();

    const getQuestion = async () => {
        try {
            if (!qid || !did) {
            }
            const data = await questionAPI.getQuestionDetail(did, qid);
            setQuestion(data);
            setTitle(data.title);
            setDescription(data.description);

            setLoading(false);
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment) {
            return setAlert(`comment is required!`, "error");
        }
        const { data: updatedQuestion } = await questionAPI.commentQuestion(
            did,
            qid,
            comment
        );
        setAlert(`Question commented successful!`, "success");
        getQuestion();
        setComment("");
    };

    const handleUpdateQuestion = async (data) => {
        const { title, description, status } = question;
        await questionAPI.updateQuestion(did, qid, {
            ...{ title, description, status },
            ...data,
        });
        setAlert(`Question updated successful!`, "success");
        setQuestion({ ...question, ...data });
    };

    const bookQuestion = async () => {
        try {
            await questionAPI.bookQuestion(did, qid);
            setAlert(`Question booked successful!`, "success");
            setQuestion({ ...question, bookmarked: true });
        } catch (error) {
            console.log(error);
            console.log(error.message);
        }
    };

    const unbookQuestion = async () => {
        try {
            await questionAPI.unbookQuestion(did, qid);
            setAlert(`Question unbooked successful!`, "success");
            setQuestion({ ...question, bookmarked: false });
        } catch (error) {
            console.log(error.message);
        }
    };

    useEffect(() => {
        const questionObject = getQuestion();
        setQuestion(questionObject);
    }, [qid]);

    return (
        <>
            <Box px={isMobile ? 0 : 6} py={isMobile ? 2 : 6}>
                {!isEdit && (
                    <>
                        <Box
                            sx={{
                                position: "relative",
                                background: "#fff",
                            }}
                        >
                            <Button
                                startIcon={<ReplyIcon />}
                                sx={{
                                    typography: "h6",
                                    mr: "auto",
                                    mb: isMobile ? 0 : 3,
                                }}
                                onClick={() => router.back()}
                            >
                                {lange("Back")}
                            </Button>
                        </Box>
                        <Box
                            mb={2}
                            mt={isMobile && 3}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                        ></Box>
                    </>
                )}
                {isEdit && (
                    <Box>
                        <Typography component="h1" variant="h5" mb={2}>
                            {lange("Update", "Question")}
                        </Typography>
                        <QuestionForm
                            onClose={() => setIsEdit(false)}
                            onSuccess={(updatedQuestion) =>
                                setQuestion(updatedQuestion)
                            }
                            originalQuestion={question}
                        />
                    </Box>
                )}
                {!isEdit && !loading && (
                    <Question
                        onUpdate={(changes) => {
                            setQuestion((prevState) => ({
                                ...prevState,
                                ...changes,
                            }));
                        }}
                        question={question}
                        isPreview={false}
                    />
                )}

                <Divider sx={{ my: 3 }} />

                <Stack
                    direction="column"
                    spacing={2}
                    pl={4}
                    divider={<Divider />}
                >
                    {question.comments?.map((comment) => {
                        return (
                            <Stack
                                direction="column"
                                spacing={1}
                                sx={{
                                    padding: 2,
                                    backgroundColor: "background.paper",
                                    borderRadius: 2,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{ fontSize: "14px" }}
                                >
                                    {`${comment.createdBy?.firstname} ${comment.createdBy?.lastname}`}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ fontSize: "14px" }}
                                >
                                    {comment.comment}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {dayjs(comment.createdAt).format(
                                        "YYYY-MM-DD HH:mm"
                                    )}
                                </Typography>
                            </Stack>

                            //Updated the comments to be bigger (14px)
                            //below is the former code.

                            // <Stack direction="column" spacing={1}>
                            //     <Typography variant="body2">{`${comment.createdBy?.firstname} ${comment.createdBy?.lastname}`}</Typography>
                            //     <Typography variant="body1">
                            //         {comment.comment}
                            //     </Typography>
                            //     <Typography variant="body2" color="neutral">
                            //         {dayjs(comment.createdAt).format(
                            //             "YYYY-MM-DD HH:mm"
                            //         )}
                            //     </Typography>
                            // </Stack>
                        );
                    })}
                </Stack>
                <Box mt={3} pt={2} component="form" onSubmit={handleComment}>
                    <TextField
                        fullWidth
                        label={lange("Add_Comment")}
                        variant="outlined"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        multiline
                        minRows={3}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton type="submit" sx={{ p: 0 }}>
                                        <SendIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: {
                                //Now includes sx that specifically targets the .MuiInputBase-root class,
                                "& .MuiInputBase-root": {
                                    //which is the underlying container for the input element in a TextField.
                                    resize: "vertical",
                                    overflow: "auto",
                                },
                            },
                        }}
                    />
                    {/* <TextField
                        fullWidth
                        label={lange("Add_Comment")}
                        variant="outlined"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        multiline
                        minRows={3}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="start">
                                    <IconButton
                                        type="submit"
                                        sx={{
                                            p: 0,
                                        }}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            resize: 'vertical',
                            overflow: 'auto',
                        }}
                    /> */}
                </Box>
            </Box>
        </>
    );
}
