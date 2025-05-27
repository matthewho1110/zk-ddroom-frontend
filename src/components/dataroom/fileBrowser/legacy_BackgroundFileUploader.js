// import internal modules
import colorConfig from "../../../configs/colorConfig";
import filetypeConfig from "../../../configs/filetypeConfig";

// import external modules
import { memo, useEffect, useState } from "react";

//import mui modules
import {
    Avatar,
    Box,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Paper,
    Tooltip,
    Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ErrorIcon from "@mui/icons-material/Error";

const UPLOAD_STATUSES = {
    UPLOADING: 0,
    SUCCESS: 1,
    ERROR: 2,
    PARTIAL_ERROR: 3,
};

function BackgroundFileUploader({ preparing, backgroundUploads, onFileClick }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const noOfOngoingUploads = Object.keys(backgroundUploads).filter(
        (key) => backgroundUploads[key].status == UPLOAD_STATUSES.UPLOADING
    ).length;

    return (
        <Box
            position="fixed"
            right={0}
            bottom={0}
            overflow="hidden"
            display="flex"
            justifyContent="flex-end"
            zIndex={100}
            component={Paper}
        >
            <List
                sx={{
                    width: "100%",
                    width: 360,
                    bgcolor: "background.paper",
                    padding: 0,
                }}
            >
                <ListItem
                    sx={{
                        fontSize: "1rem",
                        padding: "0.8rem 1.3rem",
                        backgroundColor: colorConfig.light.fileUploader.topBar,
                        color: "white",
                    }}
                >
                    <>
                        {preparing
                            ? "Preparing uploads"
                            : noOfOngoingUploads > 0
                            ? "Uploading " + noOfOngoingUploads + " items"
                            : "All uploads completed"}
                    </>

                    <IconButton
                        onClick={toggleExpand}
                        sx={{
                            color: "inherit",
                            display: "flex",
                            marginLeft: "auto",
                            transform: isExpanded
                                ? "rotate(0deg)"
                                : "rotate(180deg)",
                            "&:hover": {
                                backgroundColor: "rgb(163, 162, 162, 0.5)",
                            },
                        }}
                    >
                        <KeyboardArrowDownIcon />
                    </IconButton>
                </ListItem>

                {isExpanded && Object.keys(backgroundUploads).length > 0 && (
                    <Box maxHeight="50vh" overflow="auto" marginBottom={5}>
                        {Object.keys(backgroundUploads).map((key, i) => {
                            const upload = backgroundUploads[key];
                            let icon;
                            switch (upload.status) {
                                case UPLOAD_STATUSES.UPLOADING:
                                    icon = (
                                        <CircularProgress
                                            variant="determinate"
                                            size={16}
                                            value={
                                                (upload.uploaded /
                                                    upload.size) *
                                                100
                                            }
                                        />
                                    );
                                    break;
                                case UPLOAD_STATUSES.SUCCESS:
                                    icon = (
                                        <CheckCircleIcon
                                            style={{
                                                color: "green",
                                            }}
                                        />
                                    );
                                    break;
                                case UPLOAD_STATUSES.ERROR:
                                    icon = (
                                        <Tooltip
                                            title={
                                                <Typography fontSize={13}>
                                                    File upload fail. This might
                                                    be due to an existing file
                                                    name, file size exceeds our
                                                    limit, or network issues.
                                                </Typography>
                                            }
                                        >
                                            <ErrorIcon color="error" />
                                        </Tooltip>
                                    );
                                    break;
                                case UPLOAD_STATUSES.PARTIAL_ERROR:
                                    icon = (
                                        <Tooltip
                                            title={
                                                <Typography fontSize={13}>
                                                    Partial file upload fail.
                                                    This might be due to an
                                                    existing file name, file
                                                    size exceeds our limit, or
                                                    network issues.
                                                </Typography>
                                            }
                                        >
                                            <ErrorIcon color="info" />
                                        </Tooltip>
                                    );
                                    break;

                                default:
                                    icon = null;
                            }
                            return (
                                <ListItem
                                    key={i}
                                    sx={{
                                        transit: "all 0.5s",
                                        padding: 0,
                                    }}
                                    secondaryAction={icon}
                                >
                                    <ListItemButton
                                        onClick={() => {
                                            if (
                                                upload.path &&
                                                upload.status !=
                                                    UPLOAD_STATUSES.UPLOADING
                                            ) {
                                                onFileClick(upload.path);
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                variant="square"
                                                sx={{
                                                    width: 35,
                                                    height: 35,
                                                }}
                                                src={
                                                    upload.type in
                                                    filetypeConfig
                                                        ? filetypeConfig[
                                                              upload.type
                                                          ].icon
                                                        : filetypeConfig[
                                                              "default"
                                                          ].icon
                                                }
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={`${upload.name}`}
                                            secondary={
                                                upload.type == "folder" &&
                                                upload.uploaded &&
                                                upload.size
                                                    ? `${upload.uploaded} of ${upload.size}`
                                                    : ""
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </Box>
                )}
            </List>
        </Box>
    );
}

export default memo(BackgroundFileUploader);
