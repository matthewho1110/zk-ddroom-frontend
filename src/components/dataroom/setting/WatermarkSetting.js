import {
    Button,
    Checkbox,
    FormControlLabel,
    Modal,
    Paper,
    Radio,
    RadioGroup,
    TextField,
    Typography,
    Stack,
    Box,
} from "@mui/material";
import SampleFileViewer from "./SampleFileViewer";
import ErrorPage from "../../reusableComponents/ErrorPage";
import useUser from "../../../hooks/useUser";
import { useEffect, useState } from "react";
import useAlert from "../../../hooks/useAlert";
import useSWR from "swr";
import lange from "@i18n";

export default function Watermark({ dataroomId }) {
    const { isLoggedIn, axiosInstance } = useUser();
    const { setAlert, alertHandler } = useAlert();
    const [watermark, setWatermark] = useState();

    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const { data: dataroomData, mutate: mutateDataroomData } = useSWR(
        dataroomId ? `/datarooms/${dataroomId}` : null,
        fetcher
    );

    const dataroom = dataroomData?.dataroom;

    useEffect(() => {
        if (dataroom?.watermark) {
            setWatermark(dataroom?.watermark);
        }
    }, [dataroomData]);

    const handleTextChange = (e) => {
        if (e.target.name == "customText") {
            setWatermark({
                ...watermark,
                customText: e.target.value,
            });
        } else {
            setWatermark({
                ...watermark,
                text: e.target.name,
            });
        }
    };
    const hanleTextPositionChange = (e) => {
        let newTextPosition = [...(watermark.textPosition || [])];
        if (e.target.checked) {
            newTextPosition = [...newTextPosition, e.target.name];
        } else {
            newTextPosition.splice(newTextPosition.indexOf(e.target.name), 1);
        }

        setWatermark({
            ...watermark,
            textPosition: newTextPosition,
        });
    };
    const handleContentOptionsChange = (e) => {
        let newContentOptions = [...(watermark.contentOptions || [])];
        if (e.target.checked) {
            newContentOptions = [...newContentOptions, e.target.name];
        } else {
            newContentOptions.splice(
                newContentOptions.indexOf(e.target.name),
                1
            );
        }

        setWatermark({
            ...watermark,
            contentOptions: newContentOptions,
        });
    };
    const handleSubmit = async () => {
        // update event
        try {
            await axiosInstance.patch(
                `${process.env.BACKEND_URI}/datarooms/${dataroomId}`,
                {
                    watermark,
                }
            );
            mutateDataroomData();
            setAlert("Setting updated successfully", "success");
        } catch (err) {
            console.log(err);
            setAlert(
                "Encountered error updating the watermark config.",
                "error"
            );
        }
    };
    let text = watermark?.text;
    let textPosition = watermark?.textPosition;
    let contentOptions = watermark?.contentOptions;

    if (!isLoggedIn) {
        return (
            <ErrorPage
                message={
                    <>
                        You have to <a href="/login">login</a> first to enter
                        this page
                    </>
                }
            />
        );
    } else {
        return (
            <Box display="flex" flexDirection="row" gap={3} mt={3}>
                <Stack direction="column" spacing={4} sx={{ width: "50%" }}>
                    <Box>
                        <Typography variant="h6">{lange("Text")}</Typography>

                        <FormControlLabel
                            control={
                                <Radio
                                    name="Confidential"
                                    checked={text == "Confidential"}
                                    onChange={handleTextChange}
                                />
                            }
                            label={lange("Confidential")}
                        />
                        <FormControlLabel
                            control={
                                <Radio
                                    name="Final"
                                    checked={text == "Final"}
                                    onChange={handleTextChange}
                                />
                            }
                            label={lange("Final")}
                        />
                        <FormControlLabel
                            control={
                                <Radio
                                    name="Protected"
                                    checked={text == "Protected"}
                                    onChange={handleTextChange}
                                />
                            }
                            label={lange("Protected")}
                        />
                        <FormControlLabel
                            control={
                                <Radio
                                    name="Custom text"
                                    checked={text == "Custom text"}
                                    onChange={handleTextChange}
                                />
                            }
                            label={lange("Custom_Text")}
                        />
                        <TextField
                            variant="outlined"
                            size="small"
                            name="customText"
                            value={watermark?.customText}
                            onChange={handleTextChange}
                            disabled={text != "Custom text"}
                        />
                    </Box>
                    <Box>
                        <Typography variant="h6">
                            {lange("Text_Position")}
                        </Typography>
                        <FormControlLabel
                            label={lange("Header_and_Footer")}
                            control={
                                <Checkbox
                                    name="Header and Footer"
                                    checked={
                                        textPosition?.indexOf(
                                            "Header and Footer"
                                        ) >= 0
                                    }
                                    onChange={hanleTextPositionChange}
                                />
                            }
                        />
                        <FormControlLabel
                            label={lange("Diagonal")}
                            control={
                                <Checkbox
                                    name="Diagonal"
                                    checked={
                                        textPosition?.indexOf("Diagonal") >= 0
                                    }
                                    onChange={hanleTextPositionChange}
                                />
                            }
                        />
                        {/* <FormControlLabel
                            label="Four Corners"
                            control={
                                <Checkbox
                                    name="Four Corners"
                                    checked={
                                        textPosition?.indexOf("Four Corners") >=
                                        0
                                    }
                                    onChange={hanleTextPositionChange}
                                />
                            }
                        /> */}
                    </Box>
                    <Box>
                        <Typography variant="h6">
                            {lange("Content_Options")}
                        </Typography>
                        <FormControlLabel
                            label={lange("Email")}
                            control={
                                <Checkbox
                                    name="Email"
                                    checked={
                                        contentOptions?.indexOf("Email") >= 0
                                    }
                                    onChange={handleContentOptionsChange}
                                />
                            }
                        />
                        <FormControlLabel
                            label={lange("User", "Name")}
                            control={
                                <Checkbox
                                    name="User Name"
                                    checked={
                                        contentOptions?.indexOf("User Name") >=
                                        0
                                    }
                                    onChange={handleContentOptionsChange}
                                />
                            }
                        />
                        <FormControlLabel
                            label={lange("Organization", "Name")}
                            control={
                                <Checkbox
                                    name="Organization Name"
                                    checked={
                                        contentOptions?.indexOf(
                                            "Organization Name"
                                        ) >= 0
                                    }
                                    onChange={handleContentOptionsChange}
                                />
                            }
                        />
                        <FormControlLabel
                            label={lange("Download", "Timestamp")}
                            control={
                                <Checkbox
                                    name="Download Timestamp"
                                    checked={
                                        contentOptions?.indexOf(
                                            "Download Timestamp"
                                        ) >= 0
                                    }
                                    onChange={handleContentOptionsChange}
                                />
                            }
                        />
                        <FormControlLabel
                            label={lange("Document", "Title")}
                            control={
                                <Checkbox
                                    name="Document Title"
                                    checked={
                                        contentOptions?.indexOf(
                                            "Document Title"
                                        ) >= 0
                                    }
                                    onChange={handleContentOptionsChange}
                                />
                            }
                        />
                        {/* <FormControlLabel
                            label="Index Number"
                            control={
                                <Checkbox
                                    name="Index Number"
                                    checked={
                                        contentOptions?.indexOf(
                                            "Index Number"
                                        ) >= 0
                                    }
                                    onChange={handleContentOptionsChange}
                                />
                            }
                        /> */}
                    </Box>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{ typography: "body2" }}
                    >
                        {lange("Save")}
                    </Button>
                </Stack>
                <Box width="50%">
                    <SampleFileViewer watermark={watermark} />
                </Box>
            </Box>
        );
    }
}
