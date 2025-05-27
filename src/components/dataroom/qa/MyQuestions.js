import React, { useState, useEffect } from "react";
import {
    Button,
    Card,
    CardContent,
    Chip,
    Box,
    Modal,
    Grid,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stack,
    Divider,
    IconButton,
    Alert,
    TextField,
    InputAdornment,
} from "@mui/material";
import styled from "@emotion/styled";
import SearchIcon from "@mui/icons-material/Search";
import { Typography } from "@mui/material";
import useQuestionAPI from "./useQuestionAPI";
import dynamic from "next/dynamic";
const QuestionForm = dynamic(import("./QuestionForm"), { ssr: false });
import TagForm from "./TagForm";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import LabelIcon from "@mui/icons-material/Label";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import ChecklistRtlSharpIcon from "@mui/icons-material/ChecklistRtlSharp";
import { useRouter } from "next/router";
import lange from "@i18n";
import useAlert from "../../../hooks/useAlert";
import { isMobile } from "react-device-detect";
import useDataroomAPI from "../../../hooks/useDataroomAPI";
import Question from "./Question";
import CreateIcon from "@mui/icons-material/Create";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import DoneIcon from "@mui/icons-material/Done";
import useConfirmationDialog from "@hooks/useConfirmationDialog";
import useSWR from "swr";
import useUser from "@hooks/useUser";
import { ROLES } from "../../../configs/roleConfig";

const FileFilter = styled(TextField)({
    "& .MuiInputBase-root.MuiOutlinedInput-root": {
        padding: "10px 16px",
        height: "100%",
    },
    "& .MuiInputBase-input.MuiOutlinedInput-input": {
        padding: 0,
    },
    "& .MuiInput-input.MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "rgb(0, 0, 0)", // (default alpha is 0.38)
    },
});

export default function Questions({ did }) {
    const [questions, setQuestions] = useState([]);
    const [questionFormOpen, setQuestionFormOpen] = useState(false);
    const [tagForm, setTagForm] = useState({
        tag: null,
        open: false,
    });
    const { axiosInstance } = useUser();
    const dataroom = useDataroomAPI(did);
    const { data: tags, mutate: mutateTags } = dataroom.getTags();

    const { setConfirmationDialog } = useConfirmationDialog();

    const [isManagingTags, setIsManagingTags] = useState(false);

    const [loading, setLoading] = useState(true);
    const [filterParams, setFilterParams] = useState({
        condition: "all",
        status: "Any",
        tags: [],
    });

    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

    const { data: dataroomData } = useSWR(
        did ? `/datarooms/${did}` : null,
        fetcher
    );

    const canManageQNA = ROLES[dataroomData?.role]?.canManageQNA == true;

    // Determine if the user is a Previewer or Reviewer
    const isPreviewerOrReviewer = ["Previewer", "Reviewer"].includes(
        dataroomData?.role
    );

    const questionAPI = useQuestionAPI();
    const router = useRouter();
    const { setAlert } = useAlert();

    const openQuestionForm = () => {
        setQuestionFormOpen(true);
    };
    const onClose = () => {
        setQuestionFormOpen(false);
    };

    const onCreateQuestionSuccess = ({ description, ...newQuestion }) => {
        setQuestions((prevState) => [newQuestion, ...prevState]);
        setQuestionFormOpen(false);
    };

    const onTagsUpdateSuccess = () => {
        mutateTags();
        setTagForm({
            tag: null,
            open: false,
        });
        getQuestions();
        setAlert("Tag created successful!", "success");
    };

    const getQuestions = async () => {
        setLoading(true);
        try {
            const data = await questionAPI.getAllQuestions(did, {
                ...filterParams,
                status:
                    filterParams.status === "Any" ? null : filterParams.status,
            });
            setQuestions([...data]);
            setLoading(false);
        } catch (error) {
            console.log(error.message);
        }
        setLoading(false);
    };
    const filterQuestions = (params) => {
        setFilterParams((prevState) => ({
            ...prevState,
            ...params,
        }));
    };

    const removeTag = async (tag) => {
        setConfirmationDialog({
            title: `Remove tag "${tag.name}"`,
            description: "Are you sure you want to remove this tag?",
            onConfirm: async () => {
                try {
                    await questionAPI.removeTag(did, tag._id);
                    setAlert("Tag removed successful!", "success");
                    mutateTags(tags.filter((res) => res._id !== tag._id));
                    getQuestions();
                } catch (error) {
                    setAlert(
                        "Something went wrong. Please try again later.",
                        "error"
                    );
                }
            },
            onCancel: () => {},
        });
    };

    useEffect(() => {
        if (!did) return;
        getQuestions();
    }, [did, filterParams]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleQuestion = (questionObject) => {
        router.push(`/dataroom/${did}/qa/detail?qid=${questionObject._id}`);
    };

    const handleFilterTags = (tagId) => {
        setFilterParams((prevState) => {
            return {
                ...prevState,
                tags: prevState.tags.includes(tagId)
                    ? prevState.tags.filter((res) => res !== tagId)
                    : [...prevState.tags, tagId],
            };
        });
    };

    return (
        <Box
            display="flex"
            p={isMobile ? 0 : 6}
            pt={isMobile ? 2 : 6}
            position="relative"
            width="100%"
        >
            <Grid container spacing={5}>
                <Grid item xs={12} md={3}>
                    {!isMobile && (
                        <Button
                            variant="contained"
                            onClick={openQuestionForm}
                            startIcon={<AddIcon />}
                            sx={{ mb: 5 }}
                        >
                            {lange("New", "Question")}
                        </Button>
                    )}

                    <Box
                        sx={{
                            display: isMobile ? "flex" : "block",
                            justifyContent: "center",
                            marginBottom: isMobile && "15px",
                            width: isMobile ? "100%" : "auto",
                            borderRadius: isMobile && "5px",
                            border:
                                isMobile && "1px solid rgba(212, 212, 212, 1)",
                        }}
                    >
                        <Box
                            display="flex"
                            flex={1}
                            alignItems="center"
                            justifyContent={isMobile ? "center" : "flex-start"}
                            mb={isMobile ? 0 : 2}
                            color={
                                filterParams.condition === "all"
                                    ? isMobile
                                        ? "#fff"
                                        : "#1E90FF"
                                    : "#959495"
                            }
                            sx={{
                                padding: isMobile && "8px 0px",
                                cursor: "pointer",
                                backgroundColor:
                                    isMobile &&
                                    filterParams.condition === "all" &&
                                    "#458EF7",
                            }}
                            onClick={(e) =>
                                filterQuestions({ condition: "all" })
                            }
                        >
                            <Stack direction="row" spacing={1}>
                                <MenuIcon />
                                <Typography variant="h6">
                                    {lange("All", "Questions")}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box
                            display="flex"
                            flex={1}
                            alignItems="center"
                            justifyContent={isMobile ? "center" : "flex-start"}
                            mb={isMobile ? 0 : 2}
                            color={
                                filterParams.condition === "bookmarked"
                                    ? isMobile
                                        ? "#fff"
                                        : "#1E90FF"
                                    : "#959495"
                            }
                            sx={{
                                cursor: "pointer",
                                padding: isMobile && "8px 0px",
                                backgroundColor:
                                    isMobile &&
                                    filterParams.condition === "bookmarked" &&
                                    "#458EF7",
                            }}
                            onClick={(e) =>
                                filterQuestions({ condition: "bookmarked" })
                            }
                        >
                            <Stack direction="row" spacing={1}>
                                <BookmarkRoundedIcon />
                                <Typography variant="h6" lineHeight="1.3">
                                    {lange("Bookmarked")}
                                </Typography>
                            </Stack>
                        </Box>

                        <Box>
                            {!isPreviewerOrReviewer && (
                                <>
                                    <Box
                                        display="flex"
                                        flex={1}
                                        alignItems="center"
                                        justifyContent={
                                            isMobile ? "center" : "flex-start"
                                        }
                                        mb={isMobile ? 0 : 2}
                                        color={
                                            filterParams.condition ===
                                            "myQuestion"
                                                ? isMobile
                                                    ? "#fff"
                                                    : "#1E90FF"
                                                : "#959495"
                                        }
                                        sx={{
                                            cursor: "pointer",
                                            padding: isMobile && "8px 0px",
                                            backgroundColor:
                                                isMobile &&
                                                filterParams.condition ===
                                                    "myQuestion" &&
                                                "#458EF7",
                                        }}
                                        onClick={(e) =>
                                            filterQuestions({
                                                condition: "myQuestion",
                                            })
                                        }
                                    >
                                        <Stack direction="row" spacing={1}>
                                            <RecordVoiceOverIcon />
                                            <Typography
                                                variant="h6"
                                                lineHeight="1.3"
                                            >
                                                {lange("My Questions")}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Box
                                        display="flex"
                                        flex={1}
                                        alignItems="center"
                                        justifyContent={
                                            isMobile ? "center" : "flex-start"
                                        }
                                        mb={isMobile ? 0 : 2}
                                        color={
                                            filterParams.condition ===
                                            "assignedToMe"
                                                ? isMobile
                                                    ? "#fff"
                                                    : "#1E90FF"
                                                : "#959495"
                                        }
                                        sx={{
                                            cursor: "pointer",
                                            padding: isMobile && "8px 0px",
                                            backgroundColor:
                                                isMobile &&
                                                filterParams.condition ===
                                                    "assignedToMe" &&
                                                "#458EF7",
                                        }}
                                        onClick={(e) =>
                                            filterQuestions({
                                                condition: "assignedToMe",
                                            })
                                        }
                                    >
                                        <Stack direction="row" spacing={1}>
                                            <EmojiPeopleIcon />
                                            <Typography
                                                variant="h6"
                                                lineHeight="1.3"
                                            >
                                                {lange("Assigned To Me")}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </>
                            )}
                        </Box>

                        {/* <Box
                            display="flex"
                            flex={1}
                            alignItems="center"
                            justifyContent={isMobile ? "center" : "flex-start"}
                            mb={isMobile ? 0 : 2}
                            color={
                                filterParams.condition === "myQuestion"
                                    ? isMobile
                                        ? "#fff"
                                        : "#1E90FF"
                                    : "#959495"
                            }
                            sx={{
                                cursor: "pointer",
                                padding: isMobile && "8px 0px",
                                backgroundColor:
                                    isMobile &&
                                    filterParams.condition === "myQuestion" &&
                                    "#458EF7",
                            }}
                            onClick={(e) =>
                                filterQuestions({ condition: "myQuestion" })
                            }
                        >
                            <Stack direction="row" spacing={1}>
                                <RecordVoiceOverIcon />
                                <Typography variant="h6" lineHeight="1.3">
                                    {lange("My Questions")}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box
                            display="flex"
                            flex={1}
                            alignItems="center"
                            justifyContent={isMobile ? "center" : "flex-start"}
                            mb={isMobile ? 0 : 2}
                            color={
                                filterParams.condition === "assignedToMe"
                                    ? isMobile
                                        ? "#fff"
                                        : "#1E90FF"
                                    : "#959495"
                            }
                            sx={{
                                cursor: "pointer",
                                padding: isMobile && "8px 0px",
                                backgroundColor:
                                    isMobile &&
                                    filterParams.condition === "assignedToMe" &&
                                    "#458EF7",
                            }}
                            onClick={(e) =>
                                filterQuestions({ condition: "assignedToMe" })
                            }
                        >
                            <Stack direction="row" spacing={1}>
                                <EmojiPeopleIcon />
                                <Typography variant="h6" lineHeight="1.3">
                                    {lange("Assigned To Me")}
                                </Typography>
                            </Stack>
                        </Box> */}
                        {!isMobile && <Divider sx={{ marginBottom: "30px" }} />}
                    </Box>
                    <Box>
                        <Box
                            display="flex"
                            alignItems="center"
                            color="#184282"
                            mb={1}
                        >
                            <Stack direction="row" spacing={1}>
                                <ChecklistRtlSharpIcon />
                                <Typography variant="h5">
                                    {lange("Status")}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box
                            display="flex"
                            alignItems="center"
                            pl={1}
                            mb="15px"
                        >
                            <RadioGroup
                                sx={{
                                    flexDirection: isMobile ? "row" : "column",
                                }}
                                value={filterParams.status}
                                onChange={(e) => {
                                    filterQuestions({ status: e.target.value });
                                }}
                            >
                                <FormControlLabel
                                    value="Any"
                                    control={<Radio />}
                                    label={lange("Any")}
                                />
                                <FormControlLabel
                                    value="In progress"
                                    control={<Radio />}
                                    label={lange("In_Progress")}
                                />
                                <FormControlLabel
                                    value="Answered"
                                    control={<Radio />}
                                    label={lange("Answered")}
                                />
                            </RadioGroup>
                        </Box>
                        {!isMobile && <Divider sx={{ marginBottom: "30px" }} />}
                    </Box>
                    <Box>
                        <Box
                            display="flex"
                            justifyContent={"space-between"}
                            alignItems="center"
                            color={"#1b3e7b"}
                            mb="15px"
                        >
                            {!isManagingTags && (
                                <Stack direction="row" spacing={1}>
                                    <LabelIcon />
                                    <Typography variant="h5">
                                        {lange("Tag")}
                                    </Typography>
                                </Stack>
                            )}

                            {isManagingTags && (
                                <>
                                    <Typography variant="h5">
                                        {lange("Manage", "Tag")}
                                    </Typography>
                                </>
                            )}

                            {canManageQNA && (
                                <Stack direction="row">
                                    <IconButton
                                        onClick={() =>
                                            setTagForm({
                                                tag: null,
                                                open: true,
                                            })
                                        }
                                    >
                                        {<AddIcon />}
                                    </IconButton>
                                    <IconButton
                                        onClick={() =>
                                            setIsManagingTags(
                                                (prevState) => !prevState
                                            )
                                        }
                                    >
                                        {!isManagingTags && <CreateIcon />}
                                        {isManagingTags && <DoneIcon />}
                                    </IconButton>
                                </Stack>
                            )}
                        </Box>

                        {!!tags.length && (
                            <Box
                                display="flex"
                                flexWrap="wrap"
                                gap={1}
                                sx={{
                                    maxHeight: isMobile ? "100px" : "500px",
                                    overflowY: "auto",
                                    marginBottom: isMobile && "15px",
                                }}
                            >
                                {tags.map((res) => {
                                    let isSelected = filterParams.tags.includes(
                                        res._id
                                    );
                                    if (isManagingTags) {
                                        return (
                                            <Chip
                                                key={res._id}
                                                label={"# " + res.name}
                                                sx={{
                                                    backgroundColor: res.color,
                                                    color: (theme) =>
                                                        theme.palette.getContrastText(
                                                            res.color
                                                        ),
                                                    "&:hover": {
                                                        backgroundColor:
                                                            res.color,
                                                    },
                                                }}
                                                onClick={() => {
                                                    setTagForm({
                                                        tag: res,
                                                        open: true,
                                                    });
                                                }}
                                                onDelete={() => {
                                                    removeTag(res);
                                                }}
                                            />
                                        );
                                    } else {
                                        return (
                                            <Chip
                                                key={res._id}
                                                label={"# " + res.name}
                                                onClick={() => {
                                                    handleFilterTags(res._id);
                                                }}
                                                variant={
                                                    isSelected
                                                        ? "filled"
                                                        : "outlined"
                                                }
                                            ></Chip>
                                        );
                                    }
                                })}
                            </Box>
                        )}
                    </Box>
                </Grid>
                {isMobile && (
                    <>
                        <FileFilter
                            InputLabelProps={{
                                shrink: true,
                                style: { display: "none" },
                            }}
                            placeholder={lange("Search")}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            name="filter"
                            sx={{
                                paddingLeft: "40px",
                                width: "100%",
                            }}
                        />
                        <Divider
                            light
                            sx={{
                                marginTop: "15px",
                                height: "1px",
                                width: "calc(100% - 40px)",
                                marginLeft: "40px",
                            }}
                        />
                    </>
                )}
                <Grid
                    item
                    xs={12}
                    md={9}
                    sx={{ paddingTop: isMobile && "15px !important" }}
                >
                    {/* {loading && (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                        >
                            <CircularProgress />
                        </Box>
                        // <Box>
                        //     {Array(5)
                        //         .fill(0)
                        //         .map((_, i) => (
                        //             <Box mb={6}>
                        //                 <Skeleton
                        //                     variant="rectangular"
                        //                     width="100%"
                        //                     height={250}
                        //                 />
                        //             </Box>
                        //         ))}
                        // </Box>
                    )} */}

                    {!loading && questions.length === 0 && (
                        <Alert severity="info">No questions found</Alert>
                    )}

                    {questions.map((question) => {
                        // let description = question.description.replace(
                        //     /(<([^>]+)>)/gi,
                        //     ""
                        // );
                        return (
                            <Box
                                mb={isMobile ? 2 : 4}
                                key={question._id}
                                width="100%"
                            >
                                <Card
                                    sx={{
                                        minWidth: 275,
                                        boxShadow:
                                            "0px 2px 5px rgb(0, 0, 0, 15%)",
                                    }}
                                >
                                    <CardContent
                                        onClick={() => handleQuestion(question)}
                                        sx={{
                                            cursor: "pointer",
                                            padding: "15px !important",
                                            "&:hover:not(:has(.book-btn:hover))":
                                                {
                                                    backgroundColor: "#f5f5f5",
                                                },
                                        }}
                                    >
                                        <Question
                                            question={question}
                                            isPreview={true}
                                            onUpdate={(changes) => {
                                                setQuestions((prevState) =>
                                                    prevState.map((q) => {
                                                        if (
                                                            q._id ===
                                                            question._id
                                                        ) {
                                                            return {
                                                                ...q,
                                                                ...changes,
                                                            };
                                                        }
                                                        return q;
                                                    })
                                                );
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </Box>
                        );
                    })}
                </Grid>
            </Grid>
            <Modal open={questionFormOpen}>
                <Box
                    margin="10vh auto"
                    width="60%"
                    maxHeight="80vh"
                    overflow={"auto"}
                    sx={{
                        padding: "30px 50px",
                    }}
                    borderRadius={2}
                    backgroundColor="white"
                    display="flex"
                    flexDirection="column"
                >
                    <Typography component="h1" variant="h5" mb={1}>
                        {lange("Create", "New_Question")}
                    </Typography>
                    <QuestionForm
                        onClose={onClose}
                        onSuccess={onCreateQuestionSuccess}
                    />
                </Box>
            </Modal>
            <Modal open={tagForm.open}>
                <Box
                    sx={{
                        padding: "30px 50px",
                        fontSize: "16px",
                        margin: "10vh auto",
                        maxWidth: "600px",
                        width: isMobile ? "85%" : "auto",
                    }}
                    display="flex"
                    flexDirection="column"
                    borderRadius={2}
                    bgcolor="white"
                    bgColor="white"
                >
                    <Typography component="h1" variant="h4" mb={2}>
                        {tagForm.tag
                            ? lange("Edit", "Tag") + ` "${tagForm.tag.name}"`
                            : lange("Create_Tag")}
                    </Typography>

                    <TagForm
                        originalTag={tagForm.tag}
                        onClose={() =>
                            setTagForm({
                                tag: null,
                                open: false,
                            })
                        }
                        onSuccess={onTagsUpdateSuccess}
                    />
                </Box>
            </Modal>
        </Box>
    );
}
