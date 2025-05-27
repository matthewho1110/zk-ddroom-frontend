import React, { useState } from "react";
import { Chip, Box, IconButton, Button, Stack, Divider } from "@mui/material";
import { Typography } from "@mui/material";
import dayjs from "dayjs";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import lange from "@i18n";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useRouter } from "next/router";
import useQuestionAPI from "./useQuestionAPI";
import useAlert from "../../../hooks/useAlert";
import CreateIcon from "@mui/icons-material/Create";
import dynamic from "next/dynamic";
import { isMobile } from "react-device-detect";
const QuestionForm = dynamic(import("./QuestionForm"), { ssr: false });

export default function Question({ question, onUpdate, isPreview = false }) {
    const { setAlert } = useAlert();
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();
    const { did } = router.query;

    const questionAPI = useQuestionAPI();

    const bookQuestion = async () => {
        try {
            await questionAPI.bookQuestion(did, question._id);
            onUpdate({ bookmarked: true });
            setAlert(`Question booked successful!`, "success");
        } catch (error) {
            console.log(error.message);
        }
    };

    const unbookQuestion = async () => {
        try {
            await questionAPI.unbookQuestion(did, question._id);
            onUpdate({ bookmarked: false });
            setAlert(`Question unbooked successful!`, "success");
        } catch (error) {
            console.log(error.message);
        }
    };

    const reopenQuestion = async () => {
        try {
            await questionAPI.updateQuestion(did, question._id, {
                status: "In progress",
            });
            onUpdate({ status: "In progress" });
            setAlert(`Question reopened successful!`, "success");
        } catch (error) {
            console.log(error.message);
        }
    };

    const closeQuestion = async () => {
        try {
            await questionAPI.updateQuestion(did, question._id, {
                status: "Answered",
            });
            onUpdate({ status: "Answered" });
            setAlert(`Question closed successful!`, "success");
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <Box width="100%">
            {!isEditing && (
                <Box>
                    <Box display="flex" justifyContent="space-between">
                        <Box
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            gap={2}
                        >
                            {question.status === "Answered" && (
                                <Typography
                                    variant="h5"
                                    display="flex"
                                    color="primary"
                                    alignItems="center"
                                    fontWeight={600}
                                >
                                    <DoneAllIcon />
                                    &nbsp;
                                    {lange(question.status)}
                                </Typography>
                            )}
                            {question.status === "In progress" && (
                                <Typography
                                    variant="h5"
                                    display="flex"
                                    color="neutral.dark"
                                    alignItems="center"
                                    fontWeight={600}
                                >
                                    <AccessTimeIcon />
                                    &nbsp;
                                    {lange("In_Progress")}
                                </Typography>
                            )}
                        </Box>

                        <Stack direction="row">
                            {!isPreview && question.status === "Answered" && (
                                <Button
                                    variant="contained"
                                    onClick={reopenQuestion}
                                    sx={{ mr: 2 }}
                                >
                                    {lange("Reopen_question")}
                                </Button>
                            )}
                            {!isPreview &&
                                question.status === "In progress" && (
                                    <Button
                                        variant="contained"
                                        onClick={closeQuestion}
                                        sx={{ mr: 2 }}
                                    >
                                        {lange("Close_question")}
                                    </Button>
                                )}

                            {!isPreview && (
                                <IconButton onClick={() => setIsEditing(true)}>
                                    <CreateIcon />
                                </IconButton>
                            )}
                            <IconButton
                                className="book-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (question.bookmarked) {
                                        unbookQuestion();
                                    } else {
                                        bookQuestion();
                                    }
                                }}
                            >
                                {question.bookmarked ? (
                                    <BookmarkRoundedIcon />
                                ) : (
                                    <BookmarkBorderOutlinedIcon />
                                )}
                            </IconButton>
                        </Stack>
                    </Box>
                    <Box
                        mt={1}
                        display="flex"
                        flexDirection="row"
                        alignItems="flex-start"
                        gap={1}
                    >
                        <Typography variant="h6" fontWeight={450}>
                            {lange("Assigned_to") + ":"}
                        </Typography>
                        <Typography variant="h6">
                            {question.experts
                                ?.map(
                                    (expert) =>
                                        `${expert.firstname} ${expert.lastname}`
                                )
                                .join(", ")}
                        </Typography>
                    </Box>
                    <Typography
                        variant="h4"
                        mt={isMobile ? "15px" : 2}
                        mb={isMobile ? "15px" : 1}
                        fontWeight={600}
                        color="#184282"
                    >
                        {question.title}
                    </Typography>
                    {!!question.tags?.length && (
                        <Box
                            display="flex"
                            flexWrap="wrap"
                            gap={1}
                            alignItems="center"
                            mb="15px"
                        >
                            {question.tags?.map((tag) => (
                                <Chip
                                    label={"# " + tag.name}
                                    key={tag._id}
                                    sx={{
                                        backgroundColor: tag.color,
                                        borderRadius: 2,
                                        height: "auto",
                                        width: "auto",
                                        "& .MuiChip-label": {
                                            py: 0.55,
                                            px: 1.75,
                                            fontSize: 12,
                                        },
                                        color: (theme) =>
                                            theme.palette.getContrastText(
                                                tag.color
                                            ),
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    {!isPreview && (
                        <>
                            <Divider sx={{ my: 3 }} />
                            <Box
                                sx={{
                                    img: {
                                        maxWidth: "100%",
                                    },
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: question.description,
                                }}
                            ></Box>
                        </>
                    )}

                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Box>
                            <Box
                                sx={{
                                    typography: "h6",
                                }}
                            >{`${question.createdBy.firstname} ${question.createdBy.lastname}`}</Box>
                            <Box
                                color="text.disabled"
                                fontSize={14}
                                sx={{
                                    typography: "body1",
                                }}
                            >
                                {dayjs(question.createdAt).format(
                                    "YYYY-MM-DD HH:mm"
                                )}
                            </Box>
                        </Box>
                        <Box
                            display="flex"
                            flexDirection={"column"}
                            sx={{
                                typography: "h6",
                                fontWeight: 600,
                            }}
                        >
                            {`${question.comments?.length || 0}  `} 
                            {lange(question.comments?.length === 1 ? "Comment" : "Comments")}
                        </Box>
                    </Box>
                </Box>
            )}
            {isEditing && (
                <QuestionForm
                    onClose={() => setIsEditing(false)}
                    onSuccess={(data) => {
                        setIsEditing(false);
                        onUpdate({ ...question, ...data });
                    }}
                    originalQuestion={question}
                />
            )}
        </Box>
    );
}
