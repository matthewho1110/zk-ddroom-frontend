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
import { useInterval } from "@utils/generalHelper";
import { set } from "lodash";

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

    const [polling, setPolling] = React.useState(false);

    const generateSummary = async () => {
        setSummary((prev) => ({
            ...prev,
            loading: true,
        }));
        setPolling(true);
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
        setPolling(false);
    };

    const getSummary = async () => {
        const { data: summaryData } = await axiosInstance.get(
            `/datarooms/${did}/files/${fileId}/summary`
        );

        if (summaryData.summary?.text?.value === "Summarizing..." || polling) {
            setSummary((prev) => ({
                ...prev,
                loading: true,
            }));
        } else {
            setSummary((prev) => ({
                ...prev,
                loading: false,
                summary: summaryData.summary?.text?.value || "",
            }));
        }
    };

    useInterval(() => {
        getSummary();
    }, 5000);

    return (
        <Drawer
            anchor="right"
            open={open}
            sx={{
                zIndex: 1301,
                '& .MuiDrawer-paper': {
                    width: '100vw', // Full width
                    height: '100vh', // Full height
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                },
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
                <Typography variant="h3">AI Summarizer</Typography>
                <IconButton onClick={onClose}>
                    <Typography variant="h3">X</Typography>
                </IconButton>
            </Box>
    
            <Box
                id="summary-area"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                flexGrow={1} // Allow it to expand fully
                px={3}
                overflow="hidden"
            >
                {summary.loading && (
                    <CircularProgress sx={{ display: 'block', mx: 'auto', mb: 2 }} />
                )}
                {summary.loading === false && summary.summary.length > 0 && (
                    <Paper
                        sx={{
                            typography: 'body1',
                            whiteSpace: 'pre-wrap',
                            p: 2,
                            mb: 2,
                            maxHeight: '60vh',
                            width: '100%',
                            overflowY: 'auto',
                        }}
                    >
                        {summary.summary}
                    </Paper>
                )}
                {summary.loading === false && (
                    <TextareaAutosize
                        style={{
                            width: '100%',
                            marginBottom: '16px',
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
    
            <Box width="100%" display="flex" justifyContent="flex-end" p={2}>
                <Button onClick={generateSummary} variant="contained" disabled={summary.loading}>
                    Generate
                </Button>
            </Box>
        </Drawer>
    );
    
};

export default Summarizer;
