// React Hooks
import React, {
    memo,
    useState,
    useRef,
    useCallback,
    useLayoutEffect,
    useEffect,
} from "react";
import { useRouter } from "next/router";
import SelectFileModal from "./selectFileModal";

// MUI Components
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Box, Stack, Paper, CircularProgress } from "@mui/material";
import Typography from "@mui/material/Typography";
import Message from "./chatMessages";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import FolderIcon from "@mui/icons-material/Folder";
import SendToMobileIcon from "@mui/icons-material/SendToMobile";

// Custom Hooks
import useUser from "../../hooks/useUser";
import useAlert from "../../hooks/useAlert";

// Custom Utils
import { validateEmail } from "../../utils/inputValidator";
import { Send } from "@mui/icons-material";
import { useInterval } from "@utils/generalHelper";
import { set } from "lodash";

const convertToTreeItems = (nodes, parentId = "") => {
    return Object.entries(nodes).map(([key, value]) => {
        const nodeId = parentId
            ? parentId == "root"
                ? "/" + parentId + "/" + key
                : parentId + "/" + key
            : key;
        let result = {};
        if (value[1]) {
            result = {
                id: nodeId,
                label: value[1] + "    " + key,
            };
        } else {
            result = {
                id: nodeId,
                label: key,
            };
        }

        if (typeof value == "object" && !value[0]) {
            result["children"] = convertToTreeItems(value, nodeId);
        }
        if (result["children"]) {
            let fileIndex = result["children"][0]["label"].split(" ")[0];
            let folderIndex = fileIndex.substr(0, fileIndex.lastIndexOf("."));

            result = {
                id: nodeId,
                label:
                    parentId === "" && key === "root"
                        ? "All Folder"
                        : folderIndex + "    " + key,
                children: result["children"],
            };
        }
        return result;
    });
};

const DEFAULT_FILE_TREE = {
    fileTree: [],
    selectedFiles: [],
    loading: true,
};

const ChatBotModal = ({ dataroomId, open, onClose, isDocked, onDock }) => {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            message: "Retrieving messages for you ...",
            createdAt: new Date().getTime(),
        },
    ]);
    const [fileTree, setFileTree] = useState(DEFAULT_FILE_TREE);
    const [message, setMessage] = useState("");
    // Custom Hooks
    const { axiosInstance } = useUser();
    const { setAlert } = useAlert();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectFileModalOpen, setSelectFileModalOpen] = useState(false);
    const [isNewFileSelected, setIsNewFileSelected] = useState({});
    const handleSelectFileModalOpen = useCallback(
        () => setSelectFileModalOpen(true),
        []
    );
    const handleSelectFiles = useCallback(async (selectedFiles) => {
        await axiosInstance.patch(
            `/datarooms/${dataroomId}/chats/selectedFiles`,
            {
                selectedFiles: selectedFiles,
            }
        );
        setFileTree((prev) => ({
            ...prev,
            selectedFiles: selectedFiles,
        }));
    }, []);
    const handleSelectFileModalClose = useCallback(
        () => setSelectFileModalOpen(false),
        []
    );

    useInterval(() => {
        getMessages();
    }, 2000);

    const handleSubmit = async (event) => {
        try {
            event.preventDefault();
            if (message === "") {
                setAlert("Message cannot be empty", "warning");
                return;
            }
            const fileCount = fileTree.selectedFiles.length;
            if (fileCount <= 0 || fileCount > 20) {
                setAlert(
                    "Please select at least 1 and at most 20 files",
                    "error"
                );
                return;
            }
            setIsSubmitting(true);

            await axiosInstance.post(`/datarooms/${dataroomId}/chats`, {
                message: message,
                selectedFiles: fileTree.selectedFiles,
            });
            setMessage("");
            setIsSubmitting(false);
        } catch (error) {
            setIsSubmitting(false);
            setAlert("Failed to send message", "error");
        }
    };

    const handleChange = (event) => {
        setMessage(event.target.value);
    };

    const getSelectedFiles = async () => {
        try {
            setFileTree(DEFAULT_FILE_TREE);
            const response = await axiosInstance.get(
                `/datarooms/${dataroomId}/chats/selectedFiles`
            );
            setFileTree({
                fileTree: convertToTreeItems(response.data.fileTree),
                selectedFiles: response.data.selectedFiles,
                loading: false,
            });
            // if (response.data.selectedFiles.length === 0) {
            //     setAlert("Please select at least one file to proceed", "info");
            //     handleSelectFileModalOpen();
            // }
        } catch (err) {
            setAlert("Failed to get selected files", "error");
            setFileTree({ ...DEFAULT_FILE_TREE, loading: false });
        }
    };

    const getMessages = async (after) => {
        try {
            const response = await axiosInstance.get(
                `/datarooms/${dataroomId}/chats${
                    after ? `?after=${after}` : ""
                }`
            );
            setMessages(response.data.messages);
            if (Object.keys(isNewFileSelected).length > 0) {
                setMessages([isNewFileSelected]);
            }

            // setAlert(selectedFiles.length, "success");
            // if (selectedFiles && selectedFiles.length > 20) {
            //     setAlert("Please select at most 20 files", "error");
            // }
            // Check if the last messages are the same
            if (
                messages.length > 0 &&
                response.data.messages.length > 0 &&
                messages[messages.length - 1].id ==
                    response.data.messages[response.data.messages.length - 1].id
            ) {
                return;
            }
        } catch (error) {
            console.log(error);
            setAlert("Failed to get messages", "error");
        }
    };

    // const messagesEndRef = useRef();

    // const scrollToBottom = () => {
    //     messagesEndRef.current?.scrollIntoView({
    //         behavior: "smooth",
    //         block: "end",
    //         inline: "nearest",
    //     });
    // };

    useEffect(() => {
        getSelectedFiles();
    }, []);

    useEffect(() => {
        if (!fileTree.loading && fileTree.selectedFiles.length === 0) {
            setAlert("Please select at least one file to proceed", "info");
            handleSelectFileModalOpen();
        }
    }, [fileTree.loading]);

    return (
        <Box
            component={Paper}
            sx={
                isDocked
                    ? {
                          width: "35vw",
                          height: "100vh",
                          marginTop: "40px",
                          padding: "40px 24px 0 24px",
                      }
                    : {
                          width: "35vw",
                          height: "60vh",
                          borderRadius: 2,
                      }
            }
            p={2}
            backgroundColor="white"
            display="flex"
            flexDirection="column"
        >
            <Box position="absolute" alignSelf="flex-start">
                {fileTree.loading && <CircularProgress size={20} />}
                {!fileTree.loading && (
                    <Button
                        onClick={handleSelectFileModalOpen}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: 0,
                            backgroundColor: "transparent",
                            color: "black",
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: "transparent",
                            },
                        }}
                        startIcon={<FolderIcon />}
                    >
                        <Typography variant="body1">File Selector</Typography>
                    </Button>
                )}

                {selectFileModalOpen && (
                    <SelectFileModal
                        open={selectFileModalOpen}
                        onClose={handleSelectFileModalClose}
                        dataroomId={dataroomId}
                        fileTree={fileTree.fileTree}
                        selectedFiles={fileTree.selectedFiles}
                        handleSelectFiles={handleSelectFiles}
                    />
                )}
            </Box>
            <Typography
                alignSelf="center"
                marginBottom={1}
                component="h1"
                variant="h5"
            >
                DDRoom Wiki
            </Typography>

            <Box position="absolute" alignSelf="flex-end">
                {/* <SendToMobileIcon
                    sx={{
                        cursor: "pointer",
                    }}
                    onClick={onDock}
                /> */}
                <CloseIcon
                    sx={{
                        cursor: "pointer",
                    }}
                    onClick={onClose}
                />
            </Box>

            <Stack
                sx={{
                    height: "82%",
                    overflowY: "scroll",
                    scrollbarColor: "transparent transparent",
                }}
                flexDirection="column-reverse"
                pt={3}
                pb={1}
                gap={1}
                boxSizing={"content-box"}
            >
                {/* {isInitializing ? (
                    <Box
                        display="flex"
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                        width="100%"
                        gap={2}
                    >
                        <Typography variant="h6" align="center">
                            Initializing chats
                        </Typography>
                        <CircularProgress size={16} />
                    </Box>
                ) : null} */}
                {messages.map((message, index) => (
                    <Message key={index} message={message} />
                ))}
                {/* <div ref={messagesEndRef} /> */}
            </Stack>

            <Box
                display="flex"
                flexDirection="row"
                component="form"
                onSubmit={handleSubmit}
                width="100%"
                gap={1}
            >
                <TextField
                    id="message"
                    fullWidth
                    placeholder="Specify your query here"
                    name="message"
                    value={message}
                    onChange={handleChange}
                    autoFocus
                    disabled={isSubmitting}
                />
                <Button
                    variant="contained"
                    type="submit"
                    sx={{ color: "white" }}
                    disabled={isSubmitting}
                    backgroundColor={isSubmitting ? "primary" : "info"}
                >
                    {isSubmitting ? (
                        <CircularProgress size={16} sx={{ color: "white" }} />
                    ) : (
                        <SendIcon />
                    )}
                </Button>
            </Box>
        </Box>
    );
};

export default memo(ChatBotModal);
