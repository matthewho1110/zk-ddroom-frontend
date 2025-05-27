import File from "./File";
import filetypeConfig from "../../../configs/filetypeConfig";

import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Checkbox,
    Avatar,
    Grid,
    Typography,
} from "@mui/material";
import lange from "@i18n";

import { useState, memo, useCallback } from "react";

import { useDropzone } from "react-dropzone";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { isMobile } from "react-device-detect";

const FileList = ({
    files,
    selectedFiles,
    onAllFilesSelect,
    onFileSelect,
    onFilesDrop,
    onFileClick,
    onFileDelete,
    onFileRename,
    onFileMove,
    onDownload,
    onOpenAccessReport,
    onOpenResendAlert,
    onFileReindex,
    excludeFiles = [],
    showDirectory = false,
    uploadDisabled = true,
    actionDisabled = false,
    selectDisabled = false,
    reindexDisabled = true,
    viewLayout,
}) => {
    const { getRootProps, isFocused, isDragAccept, isDragReject } = useDropzone(
        {
            onDrop: onFilesDrop,
        }
    );
    const isSelectMode = selectedFiles?.length > 0;
    const isGrid = viewLayout === "grid";

    const dropzoneProps = uploadDisabled == true ? {} : getRootProps();

    const shownFiles = files.filter(
        (file) => excludeFiles.indexOf(file._id) < 0
    );

    const onDragEnd = (result) => {
        if (result.destination == null) return;
        if (result.destination.index == result.source.index) return;
        onFileReindex(result.draggableId, result.destination.index);
    };

    return (
        <Box height="100%" overflow="auto">
            {(isDragAccept || files.length === 0) && !uploadDisabled && (
                <Box
                    position="absolute"
                    width="100%"
                    height="100%"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    backgroundColor={
                        isDragAccept ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)"
                    }
                    color={isDragAccept ? "white" : "#02264a"}
                    style={{ pointerEvents: "none" }}
                    zIndex={100}
                    sx={{ typography: "h6" }}
                >
                    <img src="/images/empty/emptyBrowser.svg" width="30%" />

                    {lange("File_Empty")}
                </Box>
            )}
            {!isMobile && (
                <TableContainer
                    sx={{
                        width: "100%",
                        overflow: "auto",
                        height: actionDisabled ? "100%" : "80vh",
                        position: "relative",
                    }}
                    {...dropzoneProps}
                    onClick={() => {}}
                    draggable={false}
                    aria-label="simple table"
                    stickyHeader
                >
                    <Table>
                        <TableHead>
                            <TableRow
                                sx={{
                                    "& td, & th": {
                                        px: 1,
                                        py: 1,
                                    },
                                }}
                            >
                                {!selectDisabled && (
                                    <TableCell align="left">
                                        <Checkbox
                                            size="small"
                                            className="onAppearAnimated"
                                            checked={
                                                selectedFiles?.length /
                                                    files.length ==
                                                1
                                            }
                                            onChange={() => {
                                                onAllFilesSelect();
                                            }}
                                        />
                                    </TableCell>
                                )}

                                <TableCell align="left">
                                    {lange("Index")}
                                </TableCell>
                                <TableCell align="left">
                                    {lange("File_Name")}
                                </TableCell>
                                {showDirectory && (
                                    <TableCell align="left">
                                        {lange("Directory")}
                                    </TableCell>
                                )}
                                <TableCell align="left">
                                    {lange("Size")}
                                </TableCell>
                                <TableCell align="left">
                                    {lange("Creation_Date")}
                                </TableCell>
                                {!actionDisabled && (
                                    <TableCell align="left">
                                        {lange("Actions")}
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="droppable">
                                {(provided) => (
                                    <TableBody
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        sx={{
                                            backgroundColor: "white",
                                        }}
                                    >
                                        {shownFiles.map((file, i) => (
                                            <File
                                                index={i}
                                                key={i}
                                                file={file}
                                                isSelectMode={isSelectMode}
                                                selected={
                                                    selectedFiles?.indexOf(
                                                        file._id
                                                    ) >= 0
                                                }
                                                onSelect={onFileSelect}
                                                onClick={onFileClick}
                                                onRename={onFileRename}
                                                onDelete={onFileDelete}
                                                onDownload={onDownload}
                                                onMove={onFileMove}
                                                onOpenAccessReport={
                                                    onOpenAccessReport
                                                }
                                                onOpenResendAlert={
                                                    onOpenResendAlert
                                                }
                                                showDirectory={showDirectory}
                                                actionDisabled={actionDisabled}
                                                selectDisabled={selectDisabled}
                                                dragDisabled={reindexDisabled}
                                            />
                                        ))}
                                        {provided.placeholder}
                                    </TableBody>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </Table>
                </TableContainer>
            )}
            {isMobile && (
                <Grid height="100%" container spacing={2}>
                    {files.map((file, i) => {
                        return (
                            <Grid
                                item
                                xs={isGrid ? 6 : 12}
                                key={i}
                                display={!isGrid && "flex"}
                                alignItems={"center"}
                            >
                                <Avatar
                                    onClick={() => onFileClick(file.path)}
                                    variant="square"
                                    sx={{
                                        width: isGrid ? "100%" : "55px",
                                        height: isGrid ? "160px" : "55px",
                                        backgroundColor: "#F6F6F6",
                                        borderRadius: "10px",
                                    }}
                                    src={
                                        file.type in filetypeConfig
                                            ? filetypeConfig[file.type].icon
                                            : filetypeConfig["default"].icon
                                    }
                                    imgProps={{
                                        sx: {
                                            width: isGrid ? "75px" : "25px",
                                            height: isGrid ? "75px" : "20px",
                                        },
                                    }}
                                    className="onAppearAnimated"
                                ></Avatar>
                                <Box flex={1} overflow={"hidden"}>
                                    <Typography
                                        variant="h4"
                                        mt={1}
                                        ml={!isGrid && 2}
                                        overflow={"hidden"}
                                        textOverflow={"ellipsis"}
                                        whiteSpace={"nowrap"}
                                    >
                                        {file.name}
                                    </Typography>
                                    <Typography
                                        variant="span"
                                        fontSize={10}
                                        mt={1}
                                        ml={!isGrid && 2}
                                    >
                                        {new Date(
                                            file.createdAt
                                        ).toDateString()}
                                    </Typography>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};

export default memo(FileList);
