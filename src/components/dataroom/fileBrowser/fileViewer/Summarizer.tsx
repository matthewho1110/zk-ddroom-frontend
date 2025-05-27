import {
    Button,
    Drawer,
    Typography,
    Box,
    TextareaAutosize,
    IconButton,
    CircularProgress,
    Paper,
} from "@mui/material";

import useUser from "../../../../hooks/useUser";

import React from "react";

import { useRouter } from "next/router";

interface SummarizerProps {
    open: boolean;
    onClose: () => void;
    fileId: string;
}

interface ISummary {
    loading: boolean;
    summary: string;
    instruction: string;
}

const Summarizer: React.FC<SummarizerProps> = ({ open, onClose, fileId }) => {
    // Get file id and dataroom id from url - nextjs
    const router = useRouter();
    const { axiosInstance } = useUser();
    const { did } = router.query;
    const [summary, setSummary] = React.useState<ISummary>({
        loading: true,
        summary: "",
        instruction: "",
    });

    const generateSummary = async () => {
        setSummary((prev) => ({
            ...prev,
            loading: true,
        }));
        const { data: summaryData } = await axiosInstance.patch(
            `/datarooms/${did}/files/${fileId}/summarize`,
            {
                summaryPrompt:
                    summary.summary?.length > 0
                        ? `Create a summary for this file.\n\Extra Note:\n${summary.instruction}`
                        : null,
            }
        );

        setSummary((prev) => ({
            loading: false,
            instruction: "",
            summary: summaryData.summary.text.value,
        }));
    };

    const getSummary = async () => {
        const { data: summaryData } = await axiosInstance.get(
            `/datarooms/${did}/files/${fileId}/summary`
        );

        console.log(summaryData);

        setSummary((prev) => ({
            ...prev,
            loading: false,
            summary: summaryData.summary?.text?.value || "",
        }));
    };

    React.useEffect(() => {
        getSummary();
    }, []);

    return (
        <Drawer
            anchor="right"
            open={open}
            sx={{
                zIndex: 1301,
            }}
        >
            <Box p={2} minWidth="30vw" maxWidth="50vw">
                <IconButton
                    onClick={onClose}
                    sx={{
                        ml: "auto",
                    }}
                >
                    <Typography variant="h3">X</Typography>
                </IconButton>

                <Typography variant="h3" my={2}>
                    AI Summarizer
                </Typography>
                <Box
                    id="summary-area"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="20vh"
                    width={"100%"}
                >
                    {summary.loading == true && (
                        <CircularProgress
                            sx={{
                                display: "block",
                                mx: "auto",
                                mb: 2,
                            }}
                        />
                    )}
                    {summary.loading == false && summary.summary.length > 0 && (
                        <Paper
                            sx={{
                                typography: "body1",
                                whiteSpace: "pre-wrap",
                                p: 2,
                                mb: 2,
                                maxHeight: "50vh",
                                overflowY: "auto",
                            }}
                        >
                            {summary.summary}
                        </Paper>
                    )}
                    {summary.loading == false && (
                        <TextareaAutosize
                            style={{
                                width: "100%",
                                marginBottom: "16px",
                            }}
                            aria-label="minimum height"
                            minRows={8}
                            placeholder={
                                summary.summary.length > 0
                                    ? "Describe how you wish to improve the generated summary"
                                    : "Generate a summary for the current document"
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
                </Box>

                <Box width="100%" display="flex" justifyContent="flex-end">
                    <Button
                        onClick={generateSummary}
                        variant="contained"
                        disabled={summary.loading}
                    >
                        Generate
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default Summarizer;
