import {
    Avatar,
    Box,
    Checkbox,
    IconButton,
    Menu,
    MenuItem,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import { useState, memo, useRef } from "react";

import filetypeConfig from "../../../configs/filetypeConfig";
import { PERMISSION_LEVELS } from "../../../configs/permissionConfig";

import { formatFileSize } from "../../../utils/fileHelper";

// custom scss
import styles from "./File.module.scss";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import lange from "@i18n";

const ITEM_HEIGHT = 48;

const Flle = ({
    index,
    file,
    onClick,
    onDelete,
    onSelect,
    onOpenAccessReport,
    onOpenResendAlert,
    onMove,
    onRename,
    onDownload,
    selected,
    showDirectory,
    actionDisabled,
    selectDisabled,
    dragDisabled,
}) => {
    const [hovered, setHovered] = useState(false);
    const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const availableActions = Object.values(PERMISSION_LEVELS)
        .find((permission) => permission.level == file.permission?.level)
        .availableActions.filter(
            (action) => !["Reindex", "Upload", "", "Download"].includes(action)
        );

    const actionMenuOpen = Boolean(actionMenuAnchorEl);

    const handleActionMenuClose = () => {
        setActionMenuAnchorEl(null);
    };
    const handleAction = (type) => {
        if (type === "Delete") {
            onDelete(file._id, file.name);
        } else if (type === "Rename") {
            onRename(file._id, file.name);
        } else if (type === "Move") {
            onMove(file._id);
        } else if (type == "View") {
            onClick(file.path);
        } else if (type === "Download") {
            onDownload(file);
        } else if (type == "Access_Report") {
            onOpenAccessReport(file._id);
        } else if (type == "Resend_Alert") {
            onOpenResendAlert(file._id);
        }
        handleActionMenuClose();
    };

    const optionMap = new Map([
        ["View", lange("View")],
        ["Move", lange("Move")],
        ["Rename", lange("Rename")],
        ["Delete", lange("Delete")],
        ["Upload", lange("Upload")],
        ["Reindex", lange("Reindex")],
        ["Download", lange("Download")],
        ["Resend_Alert", lange("Resend_Alert")],
        ["Access_Report", lange("Access_Report")],
    ]);

    const showOptions = (e) => {
        e.preventDefault();
        setActionMenuAnchorEl(e.currentTarget);
        setMenuPosition({ top: e.clientY, left: e.clientX });
    };
    return (
        <Draggable
            key={file._id}
            draggableId={file._id}
            index={index}
            isDragDisabled={dragDisabled}
        >
            {(provided, snapshot) => (
                <TableRow
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    key={file._id}
                    sx={{
                        "&:last-child td, &:last-child th": {
                            border: 0,
                        },
                        "& td, & th": {
                            px: 1,
                            py: 1,
                        },
                        "&:hover": {
                            backgroundColor: "var(--light-gray)",
                        },
                        cursor: "pointer !important",
                    }}
                    onClick={() => onSelect && onSelect(file._id, !selected)}
                    onDoubleClick={() => {
                        onClick(file.path);
                    }}
                    onContextMenu={(e) => showOptions(e, file)}
                >
                    {!selectDisabled && (
                        <TableCell align="left">
                            <Checkbox
                                size="small"
                                className="onAppearAnimated"
                                checked={selected}
                                onChange={() => onSelect(file._id, !selected)}
                            />
                        </TableCell>
                    )}
                    <TableCell
                        align="left"
                        sx={{
                            overflow: "auto",
                        }}
                    >
                        {file.index}
                    </TableCell>
                    <TableCell align="left">
                        <Box
                            whiteSpace="no-wrap"
                            display="flex"
                            flexDirection="row"
                            justifyContent="flex-start"
                            alignItems="center"
                        >
                            <Avatar
                                variant="square"
                                sx={{
                                    width: 28,
                                    height: 28,
                                    marginRight: 2,
                                }}
                                src={
                                    file.type in filetypeConfig
                                        ? filetypeConfig[file.type].icon
                                        : filetypeConfig["default"].icon
                                }
                                className="onAppearAnimated"
                            ></Avatar>
                            <Box
                                sx={{
                                    "&:hover": {
                                        textDecoration: "underline",
                                        color: "var(--main-blue)",
                                    },
                                }}
                                onClick={() => {
                                    onClick(file.path);
                                }}
                            >
                                {file.name}
                            </Box>
                        </Box>
                    </TableCell>
                    {showDirectory && (
                        <TableCell
                            align="left"
                            sx={{
                                overflow: "hidden",
                            }}
                        >
                            {file.directory}
                        </TableCell>
                    )}
                    <TableCell
                        align="left"
                        sx={{
                            overflow: "hidden",
                        }}
                    >
                        {file.size > 0 ? formatFileSize(file.size) : null}
                    </TableCell>
                    <TableCell
                        align="left"
                        sx={{
                            overflow: "hidden",
                        }}
                    >
                        {new Date(file.createdAt).toDateString()}
                    </TableCell>
                    {!actionDisabled && (
                        <TableCell
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <IconButton
                                aria-label="action"
                                id="action-button"
                                aria-controls={
                                    actionMenuOpen ? "long-menu" : undefined
                                }
                                aria-expanded={
                                    actionMenuOpen ? "true" : undefined
                                }
                                aria-haspopup="true"
                                size="medium"
                                onClick={showOptions}
                            >
                                <MoreHorizIcon fontSize="inherit" />
                            </IconButton>
                            <Menu
                                id="action-menu"
                                MenuListProps={{
                                    "aria-labelledby": "action-button",
                                }}
                                anchorEl={actionMenuAnchorEl}
                                anchorReference="anchorPosition"
                                anchorPosition={{
                                    top: menuPosition.top,
                                    left: menuPosition.left,
                                }}
                                open={actionMenuOpen}
                                onClose={handleActionMenuClose}
                                PaperProps={{
                                    style: {
                                        maxHeight: ITEM_HEIGHT * 4.5,
                                        minWidth: "200px",
                                    },
                                }}
                                transformOrigin={{
                                    horizontal: "right",
                                    vertical: "top",
                                }}
                                anchorOrigin={{
                                    horizontal: "right",
                                    vertical: "bottom",
                                }}
                                elevation={1}
                            >
                                {availableActions.map((option) => {
                                    if (
                                        file.type === "folder" &&
                                        option === "Download"
                                    ) {
                                        return null;
                                    }
                                    return (
                                        <MenuItem
                                            key={option}
                                            onClick={() => handleAction(option)}
                                            disabled={option == "Edit"}
                                        >
                                            {optionMap.get(option)}
                                        </MenuItem>
                                    );
                                })}
                            </Menu>
                        </TableCell>
                    )}
                </TableRow>
            )}
        </Draggable>
    );
};

export default memo(Flle);
