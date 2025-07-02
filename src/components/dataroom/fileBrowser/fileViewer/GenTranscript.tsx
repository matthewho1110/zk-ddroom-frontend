import {
    Button,
    Drawer,
    Typography,
    Box,
    TextareaAutosize,
    IconButton,
    CircularProgress,
    Paper,
    styled,
} from "@mui/material";

import useUser from "../../../../hooks/useUser";

import useAlert from "../../../../hooks/useAlert";

import React from "react";

import { useRouter } from "next/router";

import { useInterval } from "@utils/generalHelper";

import LinearProgress from "@mui/material/LinearProgress";

import { Document, Packer, Paragraph, TextRun } from "docx";

import { set } from "lodash";

// @ts-ignore
import { v4 } from "uuid";

import axios from "axios";

import useSWR from "swr";

const commonLanguages = [
    {
        code: "auto",
        name: "Auto Detect (Select if you are unsure about the language of the audio or if it is multilingual)",
    },
    { code: "en", name: "English" },
    { code: "zh", name: "Chinese / Cantonese" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "ar", name: "Arabic" },
    { code: "ru", name: "Russian" },
    { code: "de", name: "German" },
    { code: "pt", name: "Portuguese" },
    { code: "ja", name: "Japanese" },
    { code: "hi", name: "Hindi" },
];

interface GenTranscriptProps {
    open: boolean;
    onClose: () => void;
    fileId: string;
    fileName: string;
    fileDirectory: string;
    canUpload: boolean;
}

interface ITranscript {
    loading: boolean;
    transcript: string;
    language: string;
    instruction: string;
}

interface ISummary {
    loading: boolean;
    summary: string;
    instruction: string;
    language: string;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const BorderLinearProgress = styled(LinearProgress)(() => ({
    height: 10,
    borderRadius: 5,
}));

const GenTranscript: React.FC<GenTranscriptProps> = ({
    open,
    onClose,
    fileId,
    fileName,
    fileDirectory,
    canUpload,
}) => {
    // Get file id and dataroom id from url - nextjs
    const router = useRouter();
    const { setAlert } = useAlert();
    const { axiosInstance } = useUser();
    const { did } = router.query;
    const [transcript, setTranscript] = React.useState<ITranscript>({
        loading: true,
        transcript: "",
        language: "",
        instruction: "",
    });
    const [summary, setSummary] = React.useState<ISummary>({
        loading: true,
        summary: "",
        instruction: "",
        language: "",
    });

    const [meetingMinutes, setMeetingMinutes] = React.useState<string>("");

    const [pollingTranscript, setPollingTranscript] = React.useState(false);
    const [pollingSummary, setPollingSummary] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);

    const generateTranscript = async () => {
        setPollingTranscript(true);
        setTranscript((prev) => ({
            ...prev,
            loading: true,
            instruction: "",
            transcript: "",
        }));
        await axiosInstance.patch(
            `/datarooms/${did}/files/${fileId}/transcript`,
            {
                language: transcript.language,
                instruction: transcript.instruction,
                modify: false,
            }
        );
    };

    const modify = async () => {
        setPollingTranscript(true);
        setTranscript((prev) => ({
            ...prev,
            loading: true,
            instruction: "",
            transcript: "",
        }));
        await axiosInstance.patch(
            `/datarooms/${did}/files/${fileId}/transcript`,
            {
                language: transcript.language,
                instruction: transcript.instruction,
                modify: true,
            }
        );
    };

    const fetcher = (url: any) =>
        axiosInstance.get(url).then((res: { data: any }) => res.data);

    const { data: dataroomData, mutate: mutateDataroomData } = useSWR(
        did ? `/datarooms/${did}` : null,
        fetcher
    );

    const { data: usedStorage } = useSWR(
        did ? `/datarooms/${did}/size` : null,
        fetcher
    );

    const dataroom = dataroomData?.dataroom;

    const generateSummary = async () => {
        setPollingSummary(true);
        setSummary((prev) => ({
            ...prev,
            loading: true,
            summary: "",
        }));
        const { data: summaryData } = await axiosInstance.patch(
            `/datarooms/${did}/files/${fileId}/summarize`,
            {
                summaryPrompt: {
                    language: summary.language,
                    instruction: summary.instruction,
                },
            }
        );
        setSummary((prev) => ({
            loading: false,
            summary: summaryData.summary.text.value,
            instruction: "",
            language: "",
        }));
    };

    const getTranscript = async () => {
        const { data: transcriptData } = await axiosInstance.get(
            `/datarooms/${did}/files/${fileId}/transcript`
        );
        if (
            transcriptData?.transcript === "loading..." ||
            transcriptData?.transcript === "Processing video..." ||
            transcriptData?.transcript?.startsWith("Creating Transcript (") ||
            pollingTranscript
        ) {
            setPollingTranscript(false);
            if (
                transcriptData?.transcript === "" ||
                transcriptData?.transcript === "loading..." ||
                transcriptData?.transcript === "Processing video..." ||
                transcriptData?.transcript?.startsWith("Creating Transcript (")
            ) {
                setTranscript((prev) => ({
                    ...prev,
                    loading: true,
                    transcript: transcriptData.transcript || "",
                }));
            }
        } else {
            setTranscript((prev) => ({
                ...prev,
                loading: false,
                transcript: transcriptData.transcript || "",
            }));
        }
    };

    const getSummary = async () => {
        const { data: summaryData } = await axiosInstance.get(
            `/datarooms/${did}/files/${fileId}/summary`
        );

        if (
            summaryData.summary?.text?.value === "Summarizing..." ||
            pollingSummary
        ) {
            setPollingSummary(false);
            setSummary((prev) => ({
                ...prev,
                loading: true,
            }));
        } else {
            setSummary((prev) => ({
                ...prev,
                loading: false,
                summary: summaryData.summary?.text?.value || "",
                // summaryData.summary?.text?.value.split("--98439483--")[0] ||
                // "",
            }));
            // setMeetingMinutes(
            //     summaryData.summary?.text?.value.split("--98439483--")[1] || ""
            // );
            // console.log(
            //     summaryData.summary?.text?.value.split("--98439483--")[1]
            // );
        }
    };

    const uploadDocument = (type: string) => async () => {
        try {
            setUploading(true);
            let textContent;
            if (type === "transcript") {
                textContent = transcript.transcript;
            } else if (type === "summary") {
                textContent = summary.summary;
            } else {
                textContent = meetingMinutes;
            }

            // Split the text into paragraphs by new lines
            const paragraphs = textContent.split("\n").map(
                (line) =>
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: line,
                                size: 24,
                                font: "Arial",
                            }),
                        ],
                    })
            );

            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: paragraphs, // Use the array of paragraphs
                    },
                ],
            });

            Packer.toBlob(doc).then(async (blob: Blob) => {
                if (dataroom?.maxStorage != -1) {
                    if (usedStorage?.size + blob.size > dataroom?.maxStorage) {
                        setAlert(
                            // @ts-ignore
                            "Upload size exceeds dataroom storage limit",
                            "warning"
                        );
                        return;
                    }
                }
                console.log(blob);
                const file = new File(
                    [blob],
                    fileName.slice(0, -4) +
                        "_" +
                        type +
                        "_" +
                        Date.now().toString() +
                        ".docx",
                    {
                        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    }
                );
                (file as any).path = file.name;
                const tempId = v4();
                const fileList = [
                    {
                        data: file,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        tempId: tempId,
                    },
                ];
                const response = await axiosInstance.patch(
                    `datarooms/${did}/files/${fileDirectory}/upload`,
                    {
                        uploads: fileList,
                    }
                );
                const signedFile = response.data;
                await handleS3Upload(signedFile[tempId], file);
                setAlert(
                    // @ts-ignore
                    "File uploaded successfully",
                    "success"
                );
                setUploading(false);
            });
        } catch (err) {
            console.log(err);
            setAlert(
                // @ts-ignore
                "An error occurred while uploading the file",
                "error"
            );
            setUploading(false);
        }
    };

    const handleS3Upload = async (
        signedFile: { s3Url: string; fileId: any },
        file: any
    ) => {
        try {
            await axios.put(signedFile.s3Url, file, {
                headers: {
                    "Content-Type": file.type,
                },
            });
            const form = new FormData();
            form.append("file", file);
            await axiosInstance.post(
                `/datarooms/${did}/files/${signedFile.fileId}/confirmUploadedWithGpt`,
                form,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
        } catch (err) {
            console.log(err);
        }
    };

    useInterval(() => {
        getTranscript();
        getSummary();
    }, 5000);

    return (
        <Drawer
            anchor="right"
            open={open}
            sx={{
                zIndex: 1301,
            }}
        >
            <Box
                p={2}
                sx={{
                    width: { xs: "100vw", md: "50vw" }, // Full screen on mobile
                    height: { xs: "100vh", md: "auto" }, // Full height on mobile
                    overflowY: "auto", // Ensure scrolling
                    flexDirection: "column",
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        ml: "auto",
                    }}
                >
                    <Typography variant="h3">X</Typography>
                </IconButton>

                <Typography variant="h3" my={2}>
                    AI Gen Transcript
                </Typography>
                <Box
                    id="transcript-area"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="25vh"
                    width={"100%"}
                >
                    {(transcript.loading == true || pollingTranscript) && (
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                margin: 2,
                                flexDirection: "column",
                            }}
                        >
                            {transcript.transcript == "loading..." && (
                                <Typography variant="h6">
                                    Preparing file
                                </Typography>
                            )}
                            {transcript.transcript == "Processing video..." && (
                                <Typography variant="h6">
                                    Processing video
                                </Typography>
                            )}
                            {transcript.transcript.startsWith(
                                "Creating Transcript ("
                            ) && (
                                <Typography variant="h6">
                                    {transcript.transcript}
                                </Typography>
                            )}

                            <Box width="100%">
                                {(pollingTranscript ||
                                    transcript.transcript == "") && (
                                    <CircularProgress
                                        sx={{
                                            display: "block",
                                            mx: "auto",
                                            mb: 2,
                                        }}
                                    />
                                )}
                                {transcript.transcript == "loading..." && (
                                    <BorderLinearProgress
                                        variant="determinate"
                                        value={0}
                                    />
                                )}
                                {transcript.transcript ==
                                    "Processing video..." && (
                                    <BorderLinearProgress
                                        variant="determinate"
                                        value={0}
                                    />
                                )}
                                {transcript.transcript.startsWith(
                                    "Creating Transcript ("
                                ) && (
                                    <BorderLinearProgress
                                        variant="determinate"
                                        value={30}
                                    />
                                )}
                            </Box>
                        </Box>
                    )}
                    {transcript.loading == false &&
                        transcript.transcript.length > 0 &&
                        !pollingTranscript && (
                            <Paper
                                sx={{
                                    typography: "body1",
                                    whiteSpace: "pre-wrap",
                                    p: 2,
                                    mb: 2,
                                    maxHeight: "25vh",
                                    width: "100%",
                                    overflowY: "auto",
                                    fontSize: "0.70rem",
                                }}
                            >
                                {transcript.transcript}
                            </Paper>
                        )}
                    {transcript.loading == false && !pollingTranscript && (
                        <select
                            value={transcript.language}
                            onChange={(e) =>
                                setTranscript((prev) => ({
                                    ...prev,
                                    language: e.target.value,
                                }))
                            }
                            style={{
                                width: "100%",
                                padding: "8px",
                                marginBottom: "16px",
                                fontSize: "12px",
                                border: "2px solid #1591ea",
                                borderRadius: "8px",
                                outline: "none",
                            }}
                        >
                            {commonLanguages.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {transcript.loading == false &&
                        transcript.transcript.length > 0 &&
                        !pollingTranscript && (
                            <TextareaAutosize
                                style={{
                                    width: "100%",
                                    marginBottom: "16px",
                                }}
                                aria-label="minimum height"
                                minRows={5}
                                placeholder={
                                    transcript.transcript.length > 0
                                        ? "Describe how you wish to improve the generated trascript"
                                        : "Generate a transcript for the current video/audio"
                                }
                                value={transcript.instruction}
                                onChange={(e) =>
                                    setTranscript((prev) => ({
                                        ...prev,
                                        instruction: e.target.value,
                                    }))
                                }
                            />
                        )}

                    <Box
                        width="100%"
                        display="flex"
                        justifyContent="flex-start"
                    >
                        <Button
                            style={{ marginBottom: "16px" }}
                            onClick={generateTranscript}
                            variant="contained"
                            disabled={
                                transcript.loading ||
                                pollingTranscript ||
                                uploading
                            }
                        >
                            {summary.loading == false &&
                            summary.summary.length > 0
                                ? "Regenerate Transcript"
                                : "Generate Transcript"}
                        </Button>
                        {transcript.loading == false &&
                            transcript.transcript.length > 0 &&
                            !pollingTranscript &&
                            canUpload && (
                                <Button
                                    style={{
                                        marginLeft: "16px",
                                        marginBottom: "16px",
                                    }}
                                    onClick={uploadDocument("transcript")}
                                    disabled={uploading}
                                    variant="contained"
                                >
                                    Upload Transcript
                                </Button>
                            )}
                        {transcript.loading == false &&
                            transcript.transcript.length > 0 &&
                            !pollingTranscript && (
                                <Button
                                    style={{
                                        marginLeft: "16px",
                                        marginBottom: "16px",
                                    }}
                                    onClick={modify}
                                    variant="contained"
                                >
                                    Modify Transcript
                                </Button>
                            )}
                    </Box>

                    {(summary.loading == true || pollingSummary) && (
                        <CircularProgress
                            sx={{
                                display: "block",
                                mx: "auto",
                                mb: 2,
                            }}
                        />
                    )}
                    {transcript.loading == false &&
                        transcript.transcript.length > 0 &&
                        !pollingTranscript &&
                        !pollingSummary &&
                        summary.loading == false &&
                        summary.summary.length > 0 && (
                            <Paper
                                sx={{
                                    typography: "body1",
                                    whiteSpace: "pre-wrap",
                                    p: 2,
                                    mb: 2,
                                    maxHeight: "25vh",
                                    width: "100%",
                                    overflowY: "auto",
                                    fontSize: "0.70rem",
                                }}
                            >
                                {summary.summary}
                            </Paper>
                        )}
                </Box>
                {transcript.loading == false &&
                    !pollingTranscript &&
                    transcript.transcript.length > 0 && (
                        <select
                            value={summary.language}
                            onChange={(e) =>
                                setSummary((prev) => ({
                                    ...prev,
                                    language: e.target.value,
                                }))
                            }
                            style={{
                                width: "100%",
                                padding: "8px",
                                marginBottom: "16px",
                                fontSize: "12px",
                                border: "2px solid #1591ea",
                                borderRadius: "8px",
                                outline: "none",
                            }}
                        >
                            {commonLanguages.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    )}

                {transcript.loading == false &&
                    transcript.transcript.length > 0 &&
                    !pollingTranscript && (
                        <TextareaAutosize
                            style={{
                                width: "100%",
                                marginBottom: "16px",
                            }}
                            aria-label="minimum height"
                            minRows={5}
                            placeholder={
                                summary.summary.length > 0
                                    ? "Describe how you wish to improve the generated summary"
                                    : "Generate a summary for the current video/audio"
                            }
                            value={summary.instruction}
                            onChange={(e) =>
                                setSummary((prev) => ({
                                    ...prev,
                                    instruction: e.target.value,
                                }))
                            }
                        />
                    )}
                {transcript.loading == false &&
                    transcript.transcript.length > 0 &&
                    !pollingTranscript && (
                        <Box
                            width="100%"
                            display="flex"
                            justifyContent="flex-start"
                        >
                            <Button
                                style={{
                                    marginBottom: "16px",
                                }}
                                onClick={generateSummary}
                                variant="contained"
                                disabled={
                                    summary.loading ||
                                    pollingSummary ||
                                    uploading
                                }
                            >
                                {summary.loading == false &&
                                summary.summary.length > 0
                                    ? "Regenerate Summary"
                                    : "Generate Summary"}
                            </Button>
                            {summary.loading == false &&
                                summary.summary.length > 0 &&
                                canUpload && (
                                    <Button
                                        style={{
                                            marginLeft: "16px",
                                            marginBottom: "16px",
                                        }}
                                        onClick={uploadDocument("summary")}
                                        disabled={uploading}
                                        variant="contained"
                                    >
                                        Upload Summary
                                    </Button>
                                )}
                        </Box>
                    )}
            </Box>
        </Drawer>
    );
};

export default GenTranscript;
