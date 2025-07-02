import {
    TextField,
    Modal,
    Button,
    Box,
    Grid,
    Typography,
    Link,
} from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view";
import { TreeItem2 } from "@mui/x-tree-view/TreeItem2";
import {
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
} from "@mui/material";
import { useTreeViewApiRef } from "@mui/x-tree-view/hooks";
import { memo, useState, useRef, forwardRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import useAlert from "../../hooks/useAlert";
import lange from "@i18n";
const File = ({ fileTree, handleSelectFiles }) => {
    const { setAlert } = useAlert();
    const getItemDescendantsIds = (item) => {
        const ids = [];
        item.children?.forEach((child) => {
            ids.push(child.id);
            ids.push(...getItemDescendantsIds(child));
        });

        return ids;
    };
    const [confirmState, setConfirmState] = useState(false);

    const getAllItemItemIds = () => {
        const ids = [];
        const registerItemId = (item) => {
            ids.push(item.id);
            item.children?.forEach(registerItemId);
        };
        fileTree.forEach(registerItemId);
        return ids;
    };

    const [selectedItems, setSelectedItems] = useState([]);
    const toggledItemRef = useRef({});
    const apiRef = useTreeViewApiRef();

    const handleItemSelectionToggle = (event, itemId, isSelected) => {
        toggledItemRef.current[itemId] = isSelected;
    };

    const handleSelectedItemsChange = (event, newSelectedItems) => {
        setSelectedItems(newSelectedItems);
        // Select / unselect the children of the toggled item
        const itemsToSelect = [];
        const itemsToUnSelect = {};
        Object.entries(toggledItemRef.current).forEach(
            ([itemId, isSelected]) => {
                const item = apiRef.current.getItem(itemId);
                if (isSelected) {
                    itemsToSelect.push(...getItemDescendantsIds(item));
                } else {
                    getItemDescendantsIds(item).forEach((descendantId) => {
                        itemsToUnSelect[descendantId] = true;
                    });
                }
            }
        );

        const newSelectedItemsWithChildren = Array.from(
            new Set(
                [...newSelectedItems, ...itemsToSelect].filter(
                    (itemId) => !itemsToUnSelect[itemId]
                )
            )
        );

        setSelectedItems(newSelectedItemsWithChildren);

        toggledItemRef.current = {};
    };

    const CustomTreeItem = forwardRef((props, ref) => (
        <TreeItem2
            ref={ref}
            {...props}
            slotProps={{
                label: {
                    id: `${props.itemId}-label`,
                    style: {
                        fontWeight: getAllItemsWithChildrenItemIds().includes(
                            props.itemId
                        )
                            ? "bold"
                            : "normal",
                    },
                },
            }}
        />
    ));

    CustomTreeItem.displayName = "CustomTreeItem";

    const getAllItemsWithChildrenItemIds = () => {
        const itemIds = [];
        const registerItemId = (item) => {
            if (item.children?.length) {
                itemIds.push(item.id);
                item.children.forEach(registerItemId);
            }
        };

        fileTree.forEach(registerItemId);

        return itemIds;
    };

    const [expandedItems, setExpandedItems] = useState(
        getAllItemsWithChildrenItemIds()
    );

    const handleExpandedItemsChange = (event, itemIds) => {
        setExpandedItems(itemIds);
    };

    const getNewSelectedFiles = () => {
        return selectedItems.filter((file) =>
            getAllItemItemIds()
                .filter(
                    (item) => !getAllItemsWithChildrenItemIds().includes(item)
                )
                .includes(file)
        );
    };

    const handleFinalSubmit = async (e) => {
        try {
            const newSelectedFiles = getNewSelectedFiles();
            e.preventDefault();
            if (newSelectedFiles.length === 0) {
                setAlert("Please select at least one file", "error");
                return;
            }

            if (newSelectedFiles.length > 10) {
                setAlert("Please select at most 10 files", "error");
                return;
            }
            handleSelectFiles(newSelectedFiles);
            setAlert("Files selected successfully", "success");
            setConfirmState(true);
        } catch (error) {
            console.error(error);
            setAlert("Failed to select files", "error");
        }
    };

    // New state for file type modal
    const [isFileTypeModalOpen, setFileTypeModalOpen] = useState(false);

    return (
        <>
            <Box
                p={2}
                position={"relative"}
                borderRadius={2}
                backgroundColor="white"
                display="flex"
                flexDirection="column"
                component="form"
                onSubmit={handleFinalSubmit}
            >
                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        ({lange("Maximum_Files_allowed")}: 10)
                    </Typography>
                </Box>
                <Typography variant="h5">
                    {lange("File_count")}:{" "}
                    {selectedItems ? getNewSelectedFiles().length : 0}
                </Typography>

                <Typography variant="body2" sx={{ fontSize: "0.6rem" }}>
                    Only supported files are displayed, see full supported file
                    list{" "}
                    <Link href="#" onClick={() => setFileTypeModalOpen(true)}>
                        here
                    </Link>
                    .
                </Typography>
                <RichTreeView
                    multiSelect
                    checkboxSelection
                    apiRef={apiRef}
                    items={fileTree}
                    selectedItems={selectedItems}
                    onSelectedItemsChange={(event, newSelectedItems) => {
                        if (confirmState) return;
                        handleSelectedItemsChange(event, newSelectedItems);
                    }}
                    onItemSelectionToggle={(event, itemId, isSelected) => {
                        if (confirmState) return;
                        handleItemSelectionToggle(event, itemId, isSelected);
                    }}
                    expandedItems={expandedItems}
                    onExpandedItemsChange={handleExpandedItemsChange}
                    slots={{ item: CustomTreeItem }}
                    sx={{
                        overflow: "auto",
                        whiteSpace: "pre-wrap",
                        pointerEvents: confirmState ? "none" : "auto",
                        opacity: confirmState ? 0.7 : 1,
                    }}
                />
                <Grid container mt={2} justifyContent="right">
                    <Grid item sx={{ mr: 2 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                                setConfirmState(false);
                            }}
                        >
                            {lange("Reselect")}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={confirmState}
                        >
                            {lange("Select")}
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* Improvement: Modal to display supported file types */}
            <Modal
                open={isFileTypeModalOpen}
                onClose={() => setFileTypeModalOpen(false)}
                sx={{
                    position: "fixed",
                    zIndex: 2002,
                }}
            >
                <Box
                    margin="20vh auto"
                    p={2}
                    width={{
                        xs: "90%",
                        md: "50%",
                    }}
                    maxHeight={"60vh"}
                    borderRadius={2}
                    backgroundColor="white"
                    display="flex"
                    flexDirection="column"
                    sx={{ overflow: "auto" }}
                >
                    <Box position="absolute" alignSelf="flex-end">
                        <CloseIcon
                            sx={{
                                cursor: "pointer",
                            }}
                            onClick={() => setFileTypeModalOpen(false)}
                        />
                    </Box>
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 2,
                            fontWeight: "bold",
                            fontSize: "1rem",
                            textDecoration: "underline",
                        }}
                    >
                        Supported File Types
                    </Typography>
                    <Typography variant="body1">
                        For text/ MIME types, the encoding must be one of utf-8,
                        utf-16, or ascii.
                    </Typography>

                    <Typography
                        variant="body2"
                        component={Paper}
                        sx={{ mt: 2, p: 2 }}
                    >
                        <TableContainer>
                            <Table
                                size="small"
                                aria-label="Supported File Types"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: "bold" }}>
                                            FILE FORMAT
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>
                                            MIME TYPE
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>.c</TableCell>
                                        <TableCell>text/x-c</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.cs</TableCell>
                                        <TableCell>text/x-csharp</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.cpp</TableCell>
                                        <TableCell>text/x-c++</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.doc</TableCell>
                                        <TableCell>
                                            application/msword
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.docx</TableCell>
                                        <TableCell>
                                            application/vnd.openxmlformats-officedocument.wordprocessingml.document
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.html</TableCell>
                                        <TableCell>text/html</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.java</TableCell>
                                        <TableCell>text/x-java</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.json</TableCell>
                                        <TableCell>application/json</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.md</TableCell>
                                        <TableCell>text/markdown</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.pdf</TableCell>
                                        <TableCell>application/pdf</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.php</TableCell>
                                        <TableCell>text/x-php</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.pptx</TableCell>
                                        <TableCell>
                                            application/vnd.openxmlformats-officedocument.presentationml.presentation
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.py</TableCell>
                                        <TableCell>text/x-python</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.py</TableCell>
                                        <TableCell>
                                            text/x-script.python
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.rb</TableCell>
                                        <TableCell>text/x-ruby</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.tex</TableCell>
                                        <TableCell>text/x-tex</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.txt</TableCell>
                                        <TableCell>text/plain</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.css</TableCell>
                                        <TableCell>text/css</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.js</TableCell>
                                        <TableCell>text/javascript</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.sh</TableCell>
                                        <TableCell>application/x-sh</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>.ts</TableCell>
                                        <TableCell>
                                            application/typescript
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Typography>
                </Box>
            </Modal>
        </>
    );
};

export default memo(File);
