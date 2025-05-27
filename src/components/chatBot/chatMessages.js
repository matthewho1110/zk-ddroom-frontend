// React Hooks
import React from "react";
import { useRouter } from "next/router";

// MUI Components
import { Box, Grid, Button } from "@mui/material";
import Typography from "@mui/material/Typography";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import Face6Icon from "@mui/icons-material/Face6";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";

const chatMessages = ({ message }) => {
    const router = useRouter();
    // Get did
    const { did } = router.query;
    const newTime = new Date(message.createdAt);

    const formattedDate =
        newTime.getFullYear() +
        "-" +
        ("0" + (newTime.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + newTime.getDate()).slice(-2) +
        " " +
        ("0" + newTime.getHours()).slice(-2) +
        ":" +
        ("0" + newTime.getMinutes()).slice(-2) +
        ":" +
        ("0" + newTime.getSeconds()).slice(-2);

    let formattedMessage = message.message;
    if (message.annotations?.length) {
        // Replace annotations with markdown links
        message.annotations.forEach((annotation) => {
            formattedMessage = formattedMessage.replace(
                annotation.placeholder,
                ""
                // `<a href="/dataroom/${did}/files?filePath=${annotation.file?._id}">${annotation.file?.name}</a>`
                // `[${annotation.file?.name}](/dataroom/${did}/files?filePath=${annotation.file?._id})`
            );
        });
    }
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            position={"relative"}
            justifyContent={
                message.role == "assistant" ? "flex-start" : "flex-end"
            }
            alignItems={message.role == "assistant" ? "flex-start" : "flex-end"}
        >
            <Box
                borderRadius={3}
                bgcolor={
                    message.role == "assistant"
                        ? "#f8fafb"
                        : "rgb(51, 153, 255, 0.8)"
                }
                color={message.role == "assistant" ? "black" : "white"}
                mb={0.5}
            >
                <Box display="flex" flexDirection="row" width="100%" gap={1}>
                    <Box ml={1} mt={1}>
                        {message.role == "assistant" ? (
                            <SmartToyIcon />
                        ) : (
                            <Face6Icon />
                        )}
                    </Box>

                    <Box fontSize={12} mr={2}>
                        <ReactMarkdown
                            children={formattedMessage || "Typing ..."}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[
                                [
                                    rehypeExternalLinks,
                                    {
                                        target: "_blank",
                                    },
                                ],
                            ]}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Annotation buttons */}

            {message.annotations?.length ? (
                <Box
                    display={"flex"}
                    flexWrap={"wrap"}
                    gap={2}
                    width="100%"
                    my={0.5}
                >
                    {message.annotations
                        .filter(
                            // Remove duplicates
                            (v, i, a) =>
                                a.findIndex(
                                    (t) => t.file?._id === v.file?._id
                                ) === i
                        )
                        .map((annotation) => (
                            <Button
                                fontSize={12}
                                variant="outlined"
                                onClick={() => {
                                    router.push(
                                        `/dataroom/${did}/files?filePath=${annotation.file?._id}`
                                    );
                                }}
                            >
                                {annotation.file?.name}
                            </Button>
                        ))}
                </Box>
            ) : null}

            <Typography
                width="100%"
                textAlign={message.role == "assistant" ? "left" : "right"}
            >
                {formattedDate}
            </Typography>
        </Box>
    );
};

export default chatMessages;
