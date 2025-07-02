// import mui modules
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { Box, TableCell, TableRow } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// import internal modules
import useAlert from "../../../hooks/useAlert";
import FilePermissionDropdown from "./FilePermissionDropdown";
import { PERMISSION_LEVELS } from "../../../configs/permissionConfig";
import styles from "./File.module.scss";

// import external modules
import axios from "axios";
import { memo, useEffect, useState } from "react";
import useUser from "../../../hooks/useUser";
import useDataroom from "../../../hooks/useDataroom";
import lange from "@i18n";
import CircularProgress from "@mui/material/CircularProgress"; // Import the loading spinner
import { set } from "lodash";

function File({
    visible,
    dataroomId,
    fileId,
    groupId,
    parentPermissionLevel,
    onPermissionUpdate,
}) {
    /* custom hooks */
    const { setAlert, alertHandler } = useAlert();

    const { axiosInstance } = useUser();

    /** React States */
    // Latest file state
    const [file, setFile] = useState(null);

    // Original file state
    const [originalFile, setOriginalFile] = useState(null);
    // Whether the file is collapsed
    const [collapsed, setCollapsed] = useState(false);
    // Whether its children have been fetched
    const [childrenFetched, setChildrenFetched] = useState(false);
    // Keep track of the group id
    const [group, setGroup] = useState(groupId);

    // Loading state
    const [loading, setLoading] = useState(false);
    const [curClick, setCurClick] = useState(null);
    const depth = file?.path?.replace(/\/+$/, "").split("/").length - 1 || 0;

    const isInherited = file?.permissions?.[groupId] == null;

    const currentPermissionLevel = isInherited
        ? parentPermissionLevel
        : file?.permissions?.[groupId];

    const fetchFilePermissions = async () => {
        try {
            const queryParams = {};

            if (!fileId) {
                queryParams["path"] = "/root";
            } else {
                queryParams["fileId"] = fileId;
            }
            const file = (
                await axiosInstance.get(
                    `${process.env.BACKEND_URI}/datarooms/${dataroomId}/filePermissions`,
                    {
                        params: queryParams,
                    }
                )
            ).data;

            setFile(file);
        } catch (err) {
            console.log(err);
            if (err.response) {
                switch (err.response.status) {
                    case 401:
                        setAlert("Unauthorized", "error");
                        break;
                    case 403:
                        setAlert("Forbidden", "error");
                        break;
                    case 404:
                        setAlert("File not found", "error");
                        break;
                    default:
                        setAlert(
                            "Unknown Error, Please try again later.",
                            "error"
                        );
                }
            } else {
                setAlert("Unknown Error, Please try again later.", "error");
            }
        }
    };

    /** Functions */
    const handleFileClick = (e) => {
        e.stopPropagation();
        if (file.type == "folder") {
            // Fetch children if not fetched
            if (!collapsed && !childrenFetched) {
                setChildrenFetched(true);
            }
            setCollapsed(!collapsed);
        }
    };

    const handleFilePermissionChange = async (newPermission) => {
        let newPermissionLevel = PERMISSION_LEVELS[newPermission].level;
        if (
            newPermissionLevel == file.permissions?.[groupId] &&
            file.path != "/root"
        ) {
            newPermissionLevel = null;
        }
        setLoading(true); // Start loading
        setCurClick(newPermission);
        try {
            await axiosInstance.patch(
                `${process.env.BACKEND_URI}/datarooms/${dataroomId}/files/${file._id}`,
                {
                    [`permissions.${groupId}`]: newPermissionLevel,
                }
            );

            setFile({
                ...file,
                permissions: {
                    ...file.permissions,
                    [groupId]: newPermissionLevel,
                },
            });
            setAlert("Permission updated", "success");
        } catch (err) {
            alertHandler(err);
        } finally {
            setLoading(false); // Stop loading
            setCurClick(null);
        }
    };

    /** React UseEffect */
    useEffect(() => {
        fetchFilePermissions();
    }, [fileId]);

    if (file) {
        return (
            <>
                {visible && (
                    <TableRow
                        key={file._id}
                        sx={{
                            "td, th": {
                                border: 0,
                                padding: "8px" + " " + 12 * (depth + 1) + "px",
                                boxSizing: "border-box",
                            },
                            "&:hover": {
                                backgroundColor: "var(--light-gray)",
                            },
                        }}
                        className={styles.fileRow}
                        onClick={handleFileClick}
                    >
                        <TableCell align="left" sx={{}} width="30%">
                            <Box
                                whiteSpace="no-wrap"
                                display="flex"
                                flexDirection="row"
                                justifyContent="flex-start"
                                alignItems="center"
                                className="onAppearAnimated"
                            >
                                {file.type == "folder" && (
                                    <>
                                        {collapsed ? (
                                            <>
                                                <KeyboardArrowDownIcon />
                                                <FolderOpenIcon
                                                    style={{ color: "grey" }}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <KeyboardArrowRightIcon />
                                                <FolderIcon
                                                    style={{ color: "grey" }}
                                                />
                                            </>
                                        )}
                                        &nbsp;&nbsp;
                                    </>
                                )}
                                {file.path == "/root"
                                    ? lange("All_Folder")
                                    : file.name}
                            </Box>
                        </TableCell>

                        {Object.keys(PERMISSION_LEVELS)
                            .sort(
                                (p1, p2) =>
                                    PERMISSION_LEVELS[p2].level -
                                    PERMISSION_LEVELS[p1].level
                            )
                            .map((permission, i) => {
                                const permissionLevel =
                                    PERMISSION_LEVELS[permission].level;
                                const activeIcon =
                                    PERMISSION_LEVELS[permission].activeIcon;
                                const inheritIcon =
                                    PERMISSION_LEVELS[permission].inheritIcon;

                                const hiddenIcon =
                                    PERMISSION_LEVELS[permission].hiddenIcon;
                                return (
                                    <TableCell
                                        key={i}
                                        align="center"
                                        sx={{
                                            padding: "8px 0 !important",
                                            width: "10%",
                                            cursor: "pointer",
                                        }}
                                        name={permission}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFilePermissionChange(
                                                permission
                                            );
                                        }}
                                        className={styles.permissionCell}
                                    >
                                        {loading && curClick === permission ? ( // Show loading spinner
                                            <Box
                                                className={
                                                    styles.permissionIcon
                                                }
                                                zIndex={1}
                                            >
                                                <CircularProgress size={20} />
                                            </Box>
                                        ) : (
                                            <>
                                                {currentPermissionLevel ==
                                                    permissionLevel &&
                                                    !isInherited && (
                                                        <Box
                                                            className={
                                                                styles.permissionIcon
                                                            }
                                                            zIndex={1}
                                                        >
                                                            {activeIcon}
                                                        </Box>
                                                    )}

                                                {isInherited &&
                                                    currentPermissionLevel ==
                                                        permissionLevel && (
                                                        <Box
                                                            className={
                                                                styles.permissionIcon
                                                            }
                                                            zIndex={888}
                                                        >
                                                            {inheritIcon}
                                                        </Box>
                                                    )}

                                                {
                                                    <Box
                                                        className={
                                                            styles.permissionIcon +
                                                            " " +
                                                            styles.hiddenIcon
                                                        }
                                                    >
                                                        {hiddenIcon}
                                                    </Box>
                                                }
                                            </>
                                        )}
                                    </TableCell>
                                );
                            })}
                    </TableRow>
                )}
                {childrenFetched &&
                    file.children.map((child, i) => (
                        <File
                            key={child._id}
                            dataroomId={dataroomId}
                            fileId={child._id}
                            groupId={groupId}
                            visible={visible && collapsed}
                            parentPermissionLevel={currentPermissionLevel}
                            onPermissionUpdate={onPermissionUpdate}
                        />
                    ))}
            </>
        );
    } else {
        return <></>;
    }
}

export default memo(File);
