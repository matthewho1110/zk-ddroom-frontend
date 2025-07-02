import { memo, useEffect, useState } from "react";
import { PERMISSION_LEVELS } from "../../../configs/permissionConfig";
import { Breadcrumbs, Link, Box, Card, Typography } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import useUser from "../../../hooks/useUser";
import useAlert from "../../../hooks/useAlert";
import lange from "@i18n";

const PERMISSION_LEVELS_MAP = Object.keys(PERMISSION_LEVELS).sort(
    (p1, p2) => PERMISSION_LEVELS[p2].level - PERMISSION_LEVELS[p1].level
);

function FileMobileView({ dataroomId, groupId }) {
    const [breadcrumbs, setBreadCrumbs] = useState([]);
    const [file, setFile] = useState(null);
    const [fileId, setFileId] = useState("");
    const [children, setChildren] = useState([]);
    const [parentPermissionLevel, setParentPermissionLevel] = useState("");
    const { axiosInstance } = useUser();
    const { setAlert, alertHandler } = useAlert();

    const fetchFilePermissions = async (fileId) => {
        try {
            const queryParams = fileId ? { fileId } : { path: "/root" };

            const response = await axiosInstance.get(
                `${process.env.BACKEND_URI}/datarooms/${dataroomId}/filePermissions`,
                { params: queryParams }
            );

            const file = response.data;

            if (fileId) {
                return file;
            }

            if (file?.permissions?.[groupId]) {
                setParentPermissionLevel(file.permissions[groupId]);
            }

            setBreadCrumbs([file]);
            setFile(file);
        } catch (err) {
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

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!isMounted) return;
            await fetchFilePermissions(fileId);
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [fileId, dataroomId, groupId, axiosInstance]);

    const isInherited = file?.permissions?.[groupId] == null;
    const currentPermissionLevel = isInherited
        ? parentPermissionLevel
        : file?.permissions?.[groupId];

    const changePermission = async (newPermission, file, isChildren) => {
        let newPermissionLevel = PERMISSION_LEVELS[newPermission].level;
        if (newPermissionLevel === file.permissions?.[groupId]) {
            newPermissionLevel = null;
        }

        try {
            await axiosInstance.patch(
                `${process.env.BACKEND_URI}/datarooms/${dataroomId}/files/${file._id}`,
                {
                    [`permissions.${groupId}`]: newPermissionLevel,
                }
            );

            if (isChildren) {
                const fileIndex = children.findIndex(
                    (res) => res._id === file._id
                );
                const _children = [...children];
                _children[fileIndex] = {
                    ...file,
                    permissions: {
                        ...file.permissions,
                        [groupId]: newPermissionLevel,
                    },
                };
                setChildren(_children);
                return;
            }

            setFile({
                ...file,
                permissions: {
                    ...file.permissions,
                    [groupId]: newPermissionLevel,
                },
            });

            if (file.name === "root" && newPermission === null) {
                setParentPermissionLevel("");
            }

            setAlert("Permission updated", "success");
        } catch (err) {
            alertHandler(err);
        }
    };

    const folderOpen = async (file) => {
        if (file.type !== "folder" || !file?.children?.length) return;

        const _children = await Promise.all(
            file.children.map((res) => fetchFilePermissions(res._id))
        );

        if (file?.permissions?.[groupId]) {
            setParentPermissionLevel(file.permissions[groupId]);
        }

        setChildren(_children);
        setBreadCrumbs([...breadcrumbs, { ...file, children: _children }]);
    };

    const breadcrumbClick = (item, index) => {
        const { children: itemChildren } = item;

        if (itemChildren?.length && index) {
            const _breadcrumbs = [...breadcrumbs];
            _breadcrumbs.splice(index + 1);
            setChildren(itemChildren);
            setBreadCrumbs(_breadcrumbs);
        } else {
            setChildren([]);
            setBreadCrumbs([file]);
        }
    };

    const renderPermissionButtons = (fileItem, isChild = false) => {
        const _isInherited =
            fileItem?.permissions?.[groupId] == null || !fileItem?.permissions;
        const _currentPermissionLevel = _isInherited
            ? parentPermissionLevel
            : fileItem?.permissions?.[groupId];

        return PERMISSION_LEVELS_MAP.map((permission, i) => {
            const permissionLevel = PERMISSION_LEVELS[permission].level;
            const { activeIcon, inheritIcon, icon, name } =
                PERMISSION_LEVELS[permission];

            return (
                <Box
                    key={i}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minWidth: "60px",
                        minHeight: "80px",
                        padding: "8px 4px",
                        cursor: "pointer",
                        "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                    }}
                    onClick={() =>
                        changePermission(permission, fileItem, isChild)
                    }
                >
                    {/* Icon Container */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 1,
                        }}
                    >
                        {icon}
                    </Box>

                    {/* Text Container */}
                    <Box
                        sx={{
                            flex: "1 0 auto",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            mb: 1,
                        }}
                    >
                        <Typography
                            component="div"
                            sx={{
                                fontSize: "10px",
                                lineHeight: 1.2,
                                textAlign: "center",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                            }}
                        >
                            {lange(name)}
                        </Typography>
                    </Box>

                    {/* Status Icon Container */}
                    <Box
                        sx={{
                            height: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mt: "auto",
                        }}
                    >
                        {_currentPermissionLevel === permissionLevel &&
                            !_isInherited &&
                            activeIcon}
                        {_isInherited &&
                            _currentPermissionLevel === permissionLevel &&
                            inheritIcon}
                    </Box>
                </Box>
            );
        });
    };

    return (
        <Box sx={{ maxWidth: "100%", overflow: "hidden" }}>
            <Breadcrumbs
                sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    marginBottom: "10px",
                    "& .MuiBreadcrumbs-separator": {
                        margin: "0 4px",
                    },
                    "& .MuiBreadcrumbs-ol": {
                        flexWrap: "nowrap",
                        overflow: "hidden",
                    },
                    "& .MuiBreadcrumbs-li": {
                        minWidth: 0,
                    },
                }}
                separator=">"
                aria-label="breadcrumb"
            >
                {breadcrumbs.map((res, index) => (
                    <Link
                        key={index}
                        underline="hover"
                        color={
                            index === breadcrumbs.length - 1
                                ? "#458DF7"
                                : "inherit"
                        }
                        onClick={() => breadcrumbClick(res, index)}
                        sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "120px",
                            display: "inline-block",
                        }}
                    >
                        {res?.name === "root" && !index
                            ? lange("All_Folder")
                            : res?.name}
                    </Link>
                ))}
            </Breadcrumbs>

            {file && (
                <Box>
                    {file.name === "root" && !children?.length ? (
                        <Card
                            variant="outlined"
                            sx={{
                                padding: "8px",
                                backgroundColor: "#F4F4F4",
                                width: "100%",
                            }}
                        >
                            <Typography
                                display="flex"
                                mb="10px"
                                alignItems="center"
                                onClick={() => folderOpen(file)}
                                variant="h1"
                                sx={{
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                <FolderIcon
                                    sx={{
                                        marginRight: "4px",
                                        fontSize: "20px",
                                    }}
                                />
                                root
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    overflowX: "auto",
                                    gap: "4px",
                                    mx: "-4px",
                                    px: "4px",
                                    "&::-webkit-scrollbar": {
                                        display: "none",
                                    },
                                    WebkitOverflowScrolling: "touch",
                                    pb: 1,
                                }}
                            >
                                {renderPermissionButtons(file)}
                            </Box>
                        </Card>
                    ) : (
                        <Box>
                            {children.map((res) => (
                                <Card
                                    key={res._id}
                                    variant="outlined"
                                    sx={{
                                        padding: "8px",
                                        backgroundColor: "#F4F4F4",
                                        marginBottom: "10px",
                                        width: "100%",
                                    }}
                                >
                                    <Typography
                                        display="flex"
                                        mb="10px"
                                        alignItems="center"
                                        onClick={() => folderOpen(res)}
                                        variant="h1"
                                        sx={{
                                            fontSize: "14px",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {res.type === "folder" ? (
                                            <FolderIcon
                                                sx={{
                                                    marginRight: "4px",
                                                    fontSize: "20px",
                                                }}
                                            />
                                        ) : (
                                            <InsertDriveFileIcon
                                                sx={{
                                                    marginRight: "4px",
                                                    fontSize: "20px",
                                                }}
                                            />
                                        )}
                                        {res.name}
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            overflowX: "auto",
                                            gap: "4px",
                                            mx: "-4px",
                                            px: "4px",
                                            "&::-webkit-scrollbar": {
                                                display: "none",
                                            },
                                            WebkitOverflowScrolling: "touch",
                                            pb: 1,
                                        }}
                                    >
                                        {renderPermissionButtons(res, true)}
                                    </Box>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}

export default memo(FileMobileView);
