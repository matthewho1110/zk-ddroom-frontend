import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Box, Alert, Stack, Grid, Chip } from "@mui/material";
import Typography from "@mui/material/Typography";
import useQuestionAPI from "./useQuestionAPI";
import { useRouter } from "next/router";
import useUser from "../../../hooks/useUser";
import lange from "@i18n";
import { SketchPicker } from "react-color";
import useAlert from "../../../hooks/useAlert";
// import { ColorBox } from 'material-ui-color';

export default function TagForm({ originalTag, onClose, onSuccess }) {
    const { setAlert } = useAlert();

    const [tag, setTag] = useState({
        name: originalTag?.name || "",
        color: originalTag?.color || "#F1F0F0",
    });

    const [errors, setErrors] = useState({
        name: "",
    });

    const questionAPI = useQuestionAPI();
    const router = useRouter();
    const { did } = router.query;

    const validInput = () => {
        let validInput = true;
        if (tag.name.length < 1 || tag.name.length > 50) {
            errors.name =
                "Tag name must be minimum 1 and maximum 50 characters long";
            validInput = false;
        }

        if (validInput) {
            return true;
        } else {
            setErrors({ ...errors });
            return false;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validInput()) {
            try {
                const changes = {
                    name: tag.name,
                    color: tag.color || "#F1F0F0",
                };
                if (originalTag) {
                    await questionAPI.updateTag(did, originalTag._id, changes);
                } else {
                    await questionAPI.createTag(did, changes);
                }
                onSuccess();
            } catch (err) {
                if (err.response?.status === 409) {
                    setErrors({ name: "Tag name already exists" });
                } else {
                    setAlert("Something went wrong", "error");
                }
            }
        }
    };

    const handleChange = (event) => {
        setTag((prevState) => {
            return { ...prevState, [event.target.name]: event.target.value };
        });
        setErrors({ name: "" });
    };

    const handleColor = (value) => {
        setTag((prevState) => {
            return { ...prevState, color: value.hex };
        });
    };
    return (
        <Grid component="form" onSubmit={handleSubmit} container spacing={2}>
            <Grid item xs={12} md={6}>
                <Typography component="div" variant="h6">
                    {lange("Tag")}*
                </Typography>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    sx={{
                        marginTop: 1,
                    }}
                    id="name"
                    name="name"
                    value={tag.name}
                    placeholder={lange("Name")}
                    onChange={handleChange}
                    error={errors.name ? true : false}
                    helperText={errors.name}
                    autoFocus
                />
                <Typography mt={1} variant="h6">
                    {lange("Preview")}
                </Typography>
                <Chip
                    label={"# " + tag.name}
                    sx={{
                        mt: 1,
                        backgroundColor: tag.color,
                        borderRadius: 2,
                        borderRadius: 2,
                        "& .MuiChip-label": {
                            py: 0.85,
                            px: 1.75,
                            fontSize: 12,
                        },
                        color: (theme) =>
                            theme.palette.getContrastText(tag.color),
                    }}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <Typography component="div" variant="h6" mb={1}>
                    {lange("Tag", "Color")}*
                </Typography>

                <SketchPicker
                    presetColors={[
                        "#f1f0f0",
                        "#e3e2e0",
                        "#efdfda",
                        "#fadec9",
                        "#fdecc8",
                        "#dbeddb",
                        "#d0e0e3",
                        "#e8deee",
                        "#f4e0e9",
                        "#ffe2dd",
                    ]}
                    color={tag.color}
                    onChange={handleColor}
                />
            </Grid>
            {/* <Typography component="div" variant="h6">
                            {lange("Description")}*
                        </Typography>
                        <TextField
                            margin="normal"
                            multiline
                            minRows={4}
                            maxRows={8}
                            required
                            fullWidth
                            name="description"
                            value={newQuestion.description}
                            onChange={handleChange}
                            type="text"
                            id="description"
                            error={errors.description ? true : false}
                            helperText={errors.description}
                        /> */}

            <Grid
                item
                width="100%"
                display="flex"
                alignItems="flex-end"
                justifyContent="flex-end"
                xs={12}
                marginTop={2}
                spacing={1}
            >
                <Button variant="contained" color="neutral" onClick={onClose}>
                    {lange("Cancel")}
                </Button>
                <Button variant="contained" type="submit" sx={{ ml: 1 }}>
                    {originalTag ? lange("Update") : lange("Create")}
                </Button>
            </Grid>
        </Grid>
    );
}
