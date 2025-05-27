import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Box, Stack, Grid, Chip } from "@mui/material";
import Typography from "@mui/material/Typography";
import useQuestionAPI from "./useQuestionAPI";
import { useRouter } from "next/router";
import lange from "@i18n";

// Import quill and quill styles
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";
import useSWR from "swr";
import ReactQuill, { Quill } from "react-quill";
window.Quill = Quill;
Quill.register("modules/imageResize", ImageResize);

import useDataroomAPI from "../../../hooks/useDataroomAPI";
import useAlert from "@hooks/useAlert";

const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
        ],
        ["link", "image"],
        ["clean"],
    ],

    imageResize: {
        parchment: Quill.import("parchment"),
    },
};

const QUILL_FORMATS = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "alt",
    "width",
    "height",
    "style",
];

export default function QuestionForm({ originalQuestion, onClose, onSuccess }) {
    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const router = useRouter();
    const { did } = router.query;
    const dataroom = useDataroomAPI(did);
    const { data: members } = dataroom.getMembers();
    const { data: tags } = dataroom.getTags();
    const { setAlert } = useAlert();
    const { data: dataroomData } = useSWR(
        did ? `/datarooms/${did}` : null,
        fetcher
    );
    const myMemberId = dataroomData?.memberId;
    const myRole = dataroomData?.role;
    const isManager = [
        "Manager",
        "Hidden Manager",
        "Contract Manager",
        "Super Admin",
    ].includes(dataroomData?.role);
    const [question, setQuestion] = useState({
        title: originalQuestion?.title || "",
        description: originalQuestion?.description || "",
        experts: originalQuestion?.experts || [],
        tags: originalQuestion?.tags || [],
    });

    const [errors, setErrors] = useState({
        title: "",
        description: "",
    });
    const questionAPI = useQuestionAPI();

    const validInput = () => {
        let validInput = true;
        if (question.title.length < 5 || question.title.length > 50) {
            errors.title =
                "Question title must be minimum 5 and maximum 50 characters long";
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
        return questionAPI.createQuestion(
            {
                title: question.title,
                description: question.description,
                tags: question.tags.map((tag) => tag._id),
                experts: question.experts.map((expert) => expert._id),
            },
            did
        );
    };

    const updateQuestion = () => {
        let changes = {};

        if (question.title !== originalQuestion.title) {
            changes.title = question.title;
        }
        if (question.description !== originalQuestion.description) {
            changes.description = question.description;
        }

        changes.tags = question.tags.map((tag) => tag._id);
        changes.experts = question.experts.map((expert) => expert._id);

        return questionAPI.updateQuestion(did, originalQuestion._id, changes);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validInput()) {
            if (originalQuestion) {
                try {
                    await updateQuestion();
                    setAlert("Question updated successfully", "success");
                    onSuccess(question);
                } catch (err) {
                    setAlert("Error updating question", "error");
                }
            } else {
                try {
                    let metadata = (await createQuestion()).data;
                    onSuccess({ ...metadata, ...question });
                    setAlert("Question created successfully", "success");
                } catch (err) {
                    setAlert("Error creating question", "error");
                }
            }
        } else {
            console.log("Question did not create");
        }
    };

    const handleTitle = (event) => {
        setQuestion((prevState) => {
            return {
                ...prevState,
                title: event.target.value,
            };
        });
        setErrors({ title: "", question: "" });
    };

    const handleExperts = (e, value) => {
        setQuestion((prevState) => {
            return {
                ...prevState,
                experts: value,
            };
        });
    };

    const handleTags = (e, value) => {
        setQuestion((prevState) => {
            return {
                ...prevState,
                tags: value,
            };
        });
    };

    const handleQuill = (value) => {
        setQuestion((prevState) => {
            return {
                ...prevState,
                description: value,
            };
        });
    };

    return (
        <Box>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ mt: 1 }}
            >
                <Typography component="div" variant="h6">
                    {lange("Title")}*
                </Typography>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    sx={{
                        marginTop: 0,
                    }}
                    id="title"
                    // label={lange("Title")}
                    name="title"
                    value={question.title}
                    placeholder={lange("Title")}
                    onChange={handleTitle}
                    error={errors.title ? true : false}
                    helperText={errors.title}
                    autoFocus
                />

                <Box mb={1}>
                    <Typography
                        sx={{ display: isManager ? "block" : "none" }}
                        component="div"
                        variant="h6"
                        mb={1}
                    >
                        {lange("Assign_Expert")}
                    </Typography>
                    <Autocomplete
                        sx={{ display: isManager ? "block" : "none" }}
                        multiple
                        value={question?.experts}
                        onChange={handleExperts}
                        id="multiple-limit-tags"
                        isOptionEqualToValue={(option, value) =>
                            option._id === value._id
                        }
                        options={members
                            .filter(
                                (member) =>
                                    member.user?.status == "Active" &&
                                    [
                                        "Manager",
                                        "Contract Manager",
                                        "Hidden Manager",
                                        "Publisher",
                                    ].includes(member.role) &&
                                    member._id !== myMemberId
                            )
                            .map((member) => member.user)}
                        getOptionLabel={(option) => {
                            return (
                                option.firstname +
                                " " +
                                option.lastname +
                                " | " +
                                option.organization +
                                " | " +
                                option.email
                            );
                        }}
                        // renderTags={()=>{}}  //tag render
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder={lange("Assign_Expert")}
                            />
                        )}
                        renderTags={
                            question.experts.length > 0
                                ? (value, getTagProps) => {
                                      return value.map((option, index) => (
                                          <Chip
                                              key={index}
                                              label={
                                                  option.firstname +
                                                  " " +
                                                  option.lastname +
                                                  " (" +
                                                  option.organization +
                                                  ")"
                                              }
                                              {...getTagProps({ index })}
                                          />
                                      ));
                                  }
                                : null
                        }
                        getLimitTagsText={(more) => {
                            return (
                                <Stack
                                    sx={{
                                        backgroundColor: "#558ff0",
                                        color: "#fff",
                                        borderRadius: "4px",
                                        padding: "2px 4px",
                                    }}
                                >
                                    {more}More
                                </Stack>
                            );
                        }}
                    />
                </Box>
                <Box mb={2}>
                    <Typography component="div" variant="h6" mb={1}>
                        {lange("Tag")}
                    </Typography>
                    <Autocomplete
                        multiple
                        value={question.tags}
                        id="multiple-limit-tags"
                        isOptionEqualToValue={(option, value) =>
                            option._id === value._id
                        }
                        options={tags}
                        onChange={handleTags}
                        getOptionLabel={(option) => option.name}
                        renderTags={(value, getTagProps) => {
                            return value.map((option, index) => (
                                <Chip
                                    key={index}
                                    label={option.name}
                                    {...getTagProps({ index })}
                                    sx={{
                                        backgroundColor: option.color,
                                        color: (theme) =>
                                            theme.palette.getContrastText(
                                                option.color
                                            ),

                                        ml: 1,
                                    }}
                                />
                            ));
                        }}
                        renderOption={(props, option, { selected }) => (
                            <li {...props}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Typography component="div" variant="body1">
                                        {option.name}
                                    </Typography>
                                    <Chip
                                        label={option.color}
                                        sx={{
                                            backgroundColor: option.color,
                                            color: (theme) =>
                                                theme.palette.getContrastText(
                                                    option.color
                                                ),

                                            ml: 1,
                                        }}
                                    />
                                </Box>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder={lange("Tags")}
                            />
                        )}
                        getLimitTagsText={(more) => {
                            return (
                                <Stack
                                    sx={{
                                        backgroundColor: "#558ff0",
                                        color: "#fff",
                                        borderRadius: "4px",
                                        padding: "2px 4px",
                                    }}
                                >
                                    {more}More
                                </Stack>
                            );
                        }}
                    />
                </Box>

                <ReactQuill
                    theme="snow"
                    classname="quill-item"
                    value={question.description}
                    onChange={handleQuill}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    bounds=".left"
                />

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
                        {lange("Cancel")}
                    </Button>
                    <Button variant="contained" type="submit" sx={{ ml: 1 }}>
                        {!originalQuestion ? lange("Create") : lange("Update")}
                    </Button>
                </Grid>
            </Box>
        </Box>
    );
}
