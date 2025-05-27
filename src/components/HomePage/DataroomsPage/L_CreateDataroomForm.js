// import internal modules
import useAlert from "../../../hooks/useAlert";
import useUser from "../../../hooks/useUser";
import { formatFileSize } from "../../../utils/fileHelper";

// import mui modules
import styled from "@emotion/styled";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    Grid,
    TextField,
    Typography,
    CircularProgress,
    Slider,
} from "@mui/material";

import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
    dataroomNameYupSchema,
    dataroomDescriptionYupSchema,
    dataroomOrganizationYupSchema,
} from "../../../utils/inputValidator";

// import external modules
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import lange from "@i18n";

const StyledDataroomInput = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        fontWeight: "regular",
    },

    // "& .MuiFormLabel-root.MuiInputLabel-root": {
    //     transform: "translate(1rem, 0.5rem) scale(1)",
    // },

    // "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
    //     transform: "translate(1rem, -0.5rem) scale(0.8)",
    // },

    // "& .MuiFormLabel-root.MuiInputLabel-root.Mui-focused": {
    //     transform: "translate(1rem, -0.5rem) scale(0.8)",
    // },

    // "& .MuiInputBase-input": {
    //     padding: "0.5rem",
    // },
});

const StyledDataroomInputSpecial = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        fontWeight: "regular",
        padding: "0 14px",
    },

    "& .MuiFormLabel-root.MuiInputLabel-root": {
        transform: "translate(1rem, 0.5rem) scale(1)",
    },

    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
        transform: "translate(1rem, -0.5rem) scale(0.8)",
    },

    "& .MuiFormLabel-root.MuiInputLabel-root.Mui-focused": {
        transform: "translate(1rem, -0.5rem) scale(0.8)",
    },

    "& .MuiInputBase-input": {
        padding: "0.5rem",
    },
});

const dataroomSchema = Yup.object().shape({
    name: dataroomNameYupSchema,
    description: dataroomDescriptionYupSchema,
    organization: dataroomOrganizationYupSchema,
});

// const INITIAL_COVER_IMAGE = {
//     filename: "",
//     preview: null,
// };

function CreateDataroomForm(props) {
    const router = useRouter();
    const { setAlert } = useAlert();
    const { axiosInstance } = useUser();
    const [agreed, setAgreed] = useState(false);

    // const [coverImage, setCoverImage] = useState(INITIAL_COVER_IMAGE);

    const handleAgree = (e) => {
        setAgreed(e.target.checked);
    };

    // const uploadCoverImg = (e) => {
    //     const file = e.target.files[0];
    //     if (!file) {
    //         setCoverImage(INITIAL_COVER_IMAGE);
    //     }

    //     if (
    //         file &&
    //         file.size < 1024 * 1024 * 20 &&
    //         isValidFileType(file.name, "image")
    //     ) {
    //         setCoverImage({
    //             filename: e.target.files[0].name,
    //             preview: URL.createObjectURL(e.target.files[0]),
    //         });
    //     } else {
    //         setCoverImage(INITIAL_COVER_IMAGE);
    //         setAlert(
    //             "File must be < 20mb and in the following formats: jpg, jpeg, png, gif",
    //             "warning"
    //         );
    //         e.target.value = null;
    //     }
    // };

    const handleSubmit = async (values) => {
        if (!agreed) {
            setAlert("Please agree to the terms and conditions", "warning");
            return;
        }

        const body = {
            name: values.name,
            description: values.description,
            organization: values.organization,
            maxStorageSize: values.maxStorageSize,
            // coverImg: e.target.coverImg.files[0],
        };

        const options = {};

        try {
            const dataroomId = (
                await axiosInstance.post(
                    process.env.BACKEND_URI + "/datarooms",
                    body,
                    options
                )
            ).data.id;
            setAlert("Dataroom created successfully", "success");
            router.push(
                `/dataroom/${dataroomId}/files?filePath=${encodeURIComponent(
                    "/root"
                )}`
            );
        } catch (err) {
            console.log(err);
            if (err.response) {
                if (err.response.status === 409) {
                    setAlert("Existing dataroom name", "warning");
                    return;
                }
            }
            setAlert("System Error. Please try again later", "error");
        }
    };

    return (
        <Grid
            container
            sx={{
                backgroundColor: "white",
                borderRadius: "1rem",
                p: 5,
                m: "10% auto",
                width: "80%",
                maxWidth: 1240,
            }}
        >
            <Grid item xs={12} md={6} sx={{ pr: 5 }}>
                <Typography variant="h2" color="primary">
                    {lange("Create", "Dataroom")}
                </Typography>
                <Typography>
                    Please ensure you have the appropriate permissions to create
                    a dataroom and note that all dataroom activities will be
                    logged for audit purposes.
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Formik
                    onSubmit={handleSubmit}
                    initialValues={{ maxStorageSize: 0 }}
                    validationSchema={dataroomSchema}
                >
                    {({
                        handleSubmit,
                        values,
                        handleChange,
                        handleBlur,
                        isSubmitting,
                        touched,
                        errors,
                    }) => (
                        <Form className={styles.form} onSubmit={handleSubmit}>
                            <StyledDataroomInput
                                type="text"
                                label="Name"
                                id="name"
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                                required
                                variant="standard"
                                sx={{ mb: 2 }}
                                error={touched.name > 0 && errors.name}
                                helperText={touched.name && errors.name}
                                onBlur={handleBlur}
                            />
                            <StyledDataroomInput
                                type="text"
                                multiline
                                value={values.description}
                                label="Description"
                                id="description"
                                name="description"
                                required
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={
                                    touched.description > 0 &&
                                    errors.description
                                }
                                helperText={
                                    touched.description && errors.description
                                }
                                variant="standard"
                                sx={{ mb: 2 }}
                            />
                            <StyledDataroomInput
                                type="text"
                                multiline
                                label="Organization"
                                id="organization"
                                name="organization"
                                value={values.organization}
                                required
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={
                                    touched.organization > 0 &&
                                    errors.organization
                                }
                                helperText={
                                    touched.organization && errors.organization
                                }
                                variant="standard"
                                sx={{ mb: 3 }}
                            />

                            <Box>
                                <Typography id="non-linear-slider" gutterBottom>
                                    Max Storage Size:{" "}
                                    {formatFileSize(values.maxStorageSize)}
                                </Typography>
                                <Slider
                                    name="maxStorageSize"
                                    id="maxStorageSize"
                                    value={values.maxStorageSize}
                                    min={0}
                                    step={100 * 1024 ** 2}
                                    max={10 * 1024 ** 3}
                                    fullWidth
                                    getAriaValueText={formatFileSize}
                                    valueLabelFormat={formatFileSize}
                                    onChange={handleChange}
                                    valueLabelDisplay="auto"
                                    aria-labelledby="non-linear-slider"
                                />
                            </Box>

                            <FormControl required sx={{ mb: 1 }}>
                                <FormControlLabel
                                    required
                                    control={
                                        <Checkbox
                                            checked={agreed}
                                            onChange={handleAgree}
                                        />
                                    }
                                    label="I have agreed to all terms and conditions"
                                />
                            </FormControl>
                            {/* {coverImage?.preview && (
                        <Box sx={{ mb: 2 }}>
                            <img
                                src={coverImage.preview}
                                alt="cover"
                                className={styles.coverImgPreview}
                                width="30%"
                            />
                        </Box>
                    )} */}
                            {/* <Box mb={2} display="flex" flexDirection="row">
                    <label htmlFor="coverImg" className={styles.uploadButton}>
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<FileUploadIcon />}
                            sx={{
                                typography: "body",
                                textTransform: "none",
                                width: "100%",
                            }}
                        >
                            Upload Cover Image
                        </Button>
                        <input
                            id="coverImg"
                            hidden
                            type="file"
                            name="coverImg"
                            accept="image/gif, image/jpeg, image/png, image/jpg, image/webp"
                            onChange={uploadCoverImg}
                        />
                    </label>
                    <Box ml={2} my="auto">
                        {coverImage?.filename}
                    </Box>
                </Box> */}
                            <Button
                                variant="contained"
                                type="submit"
                                sx={{
                                    p: "0.5rem 1rem",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                }}
                                loading={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <CircularProgress
                                        size={18}
                                        color="secondary"
                                    />
                                ) : (
                                    <Typography variant="body1">
                                        Submit
                                    </Typography>
                                )}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Grid>
        </Grid>
    );
}

export default CreateDataroomForm;
