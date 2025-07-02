import {
    Grid,
    Modal,
    Box,
    Typography,
    Stack,
    Button,
    TextField,
    InputBase,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Checkbox,
    Chip,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import lange from "@i18n";
import useSWR from "swr";
import useUser from "@hooks/useUser";
import useAlert from "@hooks/useAlert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import {
    getDefaultSubject,
    getDefaultNote,
} from "@configs/dataroom/member/fileNotifications";

// Import quill and quill styles
import "react-quill/dist/quill.snow.css";
import ReactQuill, { Quill } from "react-quill";
window.Quill = Quill;

const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
        ],
        ["link"],
        ["clean"],
    ],
};

const QUILL_FORMATS = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
];

const ResendAlertModal = ({ dataroomId, open, onClose, onSuccess, files }) => {
    const [searchValue, setSearchValue] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState([]);

    const receipentStack = useRef(null);

    const { setAlert } = useAlert();
    const { axiosInstance } = useUser();
    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const { data: groups } = useSWR(
        dataroomId ? `/datarooms/${dataroomId}/groups` : null,
        fetcher
    );
    const { data: members } = useSWR(
        dataroomId ? `/datarooms/${dataroomId}/members` : null,
        fetcher
    );

    const { data: dataroomData } = useSWR(
        dataroomId ? `/datarooms/${dataroomId}` : null,
        fetcher
    );

    const notAssignedMemberList =
        members
            ?.filter(
                (member) =>
                    member.user.status == "Active" &&
                    member.group.name == "Not Assigned"
            )
            .map((member) => {
                return {
                    id: member._id,
                    type: "member",
                    name: `${member.user.firstname} ${member.user.lastname}`,
                    subName: member.email,
                    organization: member.user.organization,
                    group: member.group,
                    role: member.role,
                };
            }) ?? [];

    const groupList =
        groups
            ?.filter((group) => group.name != "Not Assigned")
            .map((group) => {
                return {
                    id: group._id,
                    type: "group",
                    name: group.name,
                    members: members?.filter(
                        (member) =>
                            member.group._id === group._id &&
                            member.user.status === "Active"
                    ),
                };
            })
            ?.filter(
                (group) => group.members?.length && group.members?.length > 0
            ) ?? [];
    const list = [...groupList, ...notAssignedMemberList];
    const dataroom = dataroomData?.dataroom;

    const [subject, setSubject] = useState(getDefaultSubject(dataroom?.name));

    const [note, setNote] = useState(
        getDefaultNote(dataroomId, dataroom?.name, files)
    );

    const handleSend = async () => {
        const groups = selectedItems.filter((item) => item.type === "group");
        const members = selectedItems.filter((item) => item.type === "member");

        if (!groups?.length && !members?.length) {
            return setAlert(
                `Please select at least one user or group!`,
                "warning"
            );
        }

        const params = {
            subject,
            note,
            members: members.map((member) => member.id),
            groups: groups.map((group) => group.id),
        };
        try {
            await axiosInstance.post(
                `/datarooms/${dataroomId}/members/notifications`,
                params
            );

            setAlert(`Alert resend successful!`, "success");
            onSuccess();
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    const handleChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleDelete = (index) => {
        const newSelectedItems = [...selectedItems];
        newSelectedItems.splice(index, 1);
        setSelectedItems(newSelectedItems);
    };

    const handleGroupOrMemberClick = (data) => {
        setSearchValue("");
        const { id } = data;

        const currentIndex = selectedItems.findIndex((item) => item.id === id);
        const newChecked = [...selectedItems];

        if (currentIndex === -1) {
            newChecked.push(data);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setSelectedItems(newChecked);
    };

    useEffect(() => {
        if (receipentStack.current) {
            receipentStack.current.scrollLeft =
                receipentStack.current.scrollWidth;
        }
    }, [selectedItems]);

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    marginTop: 5,
                    background: "white",
                    width: "80%",
                    mx: "auto",
                    borderRadius: 2,
                }}
                p={4}
                height="80vh"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
            >
                <Grid container spacing={2} sx={{ mb: 2 }} height="90%">
                    <Grid height="100%" item xs={12} md={5} overflow="auto">
                        <Box display="flex" px={2} flexDirection="column">
                            <Typography variant="h5" fontSize={18} mb={4}>
                                {lange("Message_Details")}
                            </Typography>
                            <Box>
                                <Typography
                                    variant="caption"
                                    display="block"
                                    fontSize={16}
                                    mb={1}
                                >
                                    {lange("Subject")}
                                    <span
                                        style={{ color: "red", marginLeft: 2 }}
                                    >
                                        *
                                    </span>
                                </Typography>

                                <TextField
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={4}
                                />
                            </Box>
                            <Box>
                                <Typography
                                    variant="caption"
                                    display="block"
                                    fontSize={16}
                                    mb={1}
                                    mt={3}
                                >
                                    {lange("Note")}
                                </Typography>

                                <ReactQuill
                                    theme="snow"
                                    classname="quill-item"
                                    value={note}
                                    onChange={(value) => {
                                        setNote(value);
                                    }}
                                    modules={QUILL_MODULES}
                                    formats={QUILL_FORMATS}
                                    bounds=".left"
                                />

                                {/* // <TextField
                                //     value={content}
                                //     onChange={(e) => setNote(e.target.value)}
                                //     fullWidth
                                //     multiline
                                //     rows={16}
                                // /> */}
                            </Box>
                        </Box>
                    </Grid>
                    <Grid height="100%" item xs={12} md={7}>
                        <Box
                            display="flex"
                            flexDirection="column"
                            height="100%"
                        >
                            <Typography variant="h5" fontSize={18} mb={4}>
                                {lange("User_Group_notify")}
                            </Typography>
                            <Box
                                mb={2}
                                border="1px solid #ddd"
                                borderRadius={1.5}
                                display="flex"
                                alignItems="center"
                                px={2}
                                height={60}
                                overflow="auto"
                                ref={receipentStack}
                            >
                                <Stack direction="row" spacing={1.5} py={1}>
                                    {selectedItems.map(
                                        (selectedItem, index) => (
                                            <Chip
                                                key={selectedItem.id}
                                                variant="outlined"
                                                color={
                                                    selectedItem.type ===
                                                    "member"
                                                        ? "default"
                                                        : "primary"
                                                }
                                                label={selectedItem.name}
                                                onDelete={() =>
                                                    handleDelete(index)
                                                }
                                            />
                                        )
                                    )}
                                </Stack>
                                <InputBase
                                    value={searchValue}
                                    onChange={handleChange}
                                    autoFocus
                                    sx={{
                                        ml: 1,
                                        minWidth: 100,
                                    }}
                                    placeholder="Select the user(s)"
                                />
                            </Box>
                            <Box height="80%" overflow="auto">
                                <List
                                    sx={{
                                        width: "100%",
                                    }}
                                >
                                    {list
                                        .filter((t) =>
                                            t.name
                                                .toLowerCase()
                                                .includes(searchValue)
                                        )
                                        .map((item, index) => {
                                            return (
                                                <>
                                                    <ListItem
                                                        key={item._id}
                                                        sx={{
                                                            background:
                                                                index % 2 === 0
                                                                    ? "#F9F9F9"
                                                                    : "#fff",
                                                            padding: 0,
                                                        }}
                                                    >
                                                        <ListItemIcon>
                                                            <Checkbox
                                                                checked={
                                                                    selectedItems.findIndex(
                                                                        (
                                                                            selectedItem
                                                                        ) =>
                                                                            selectedItem.id ===
                                                                            item.id
                                                                    ) !== -1
                                                                }
                                                                onChange={() =>
                                                                    handleGroupOrMemberClick(
                                                                        item
                                                                    )
                                                                }
                                                            />
                                                        </ListItemIcon>
                                                        <Box
                                                            width="100%"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="space-between"
                                                            sx={{
                                                                color:
                                                                    item.type ===
                                                                    "member"
                                                                        ? "black"
                                                                        : "primary.main",
                                                                p: 1,
                                                                cursor: "pointer",
                                                            }}
                                                            onClick={() => {
                                                                if (
                                                                    item.type ===
                                                                    "group"
                                                                ) {
                                                                    setExpandedGroups(
                                                                        (
                                                                            prevState
                                                                        ) => {
                                                                            if (
                                                                                prevState.includes(
                                                                                    item.id
                                                                                )
                                                                            )
                                                                                return prevState.filter(
                                                                                    (
                                                                                        id
                                                                                    ) =>
                                                                                        id !==
                                                                                        item.id
                                                                                );
                                                                            else
                                                                                return [
                                                                                    ...prevState,
                                                                                    item.id,
                                                                                ];
                                                                        }
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <ListItemText
                                                                secondaryTypographyProps={{
                                                                    fontSize: 12,
                                                                    color:
                                                                        item.type ===
                                                                        "member"
                                                                            ? "black"
                                                                            : "primary.main",
                                                                }}
                                                                primaryTypographyProps={{
                                                                    variant:
                                                                        "h6",
                                                                }}
                                                                primary={
                                                                    <Box
                                                                        display="flex"
                                                                        alignItems="center"
                                                                    >
                                                                        {item.name +
                                                                            (item.type ==
                                                                            "member"
                                                                                ? ` (${item.organization})`
                                                                                : "")}
                                                                        {item.type ==
                                                                        "group" ? (
                                                                            expandedGroups.includes(
                                                                                item.id
                                                                            ) ? (
                                                                                <ExpandLessIcon
                                                                                    sx={{
                                                                                        ml: 1,
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <ExpandMoreIcon
                                                                                    sx={{
                                                                                        ml: 1,
                                                                                    }}
                                                                                />
                                                                            )
                                                                        ) : null}
                                                                    </Box>
                                                                }
                                                                secondary={
                                                                    item.type ===
                                                                    "group"
                                                                        ? item
                                                                              .members
                                                                              .length +
                                                                          " members"
                                                                        : item.subName
                                                                }
                                                            />
                                                            <span
                                                                style={{
                                                                    fontSize: 12,
                                                                }}
                                                            >
                                                                {item.role ||
                                                                    "Group"}
                                                            </span>
                                                        </Box>
                                                    </ListItem>
                                                    {
                                                        // if group is expanded, show members
                                                        expandedGroups.includes(
                                                            item.id
                                                        ) &&
                                                            item.members.map(
                                                                (member) => {
                                                                    return (
                                                                        <ListItem
                                                                            key={
                                                                                item._id
                                                                            }
                                                                            sx={{
                                                                                background:
                                                                                    index %
                                                                                        2 ===
                                                                                    0
                                                                                        ? "#F9F9F9"
                                                                                        : "#fff",
                                                                                padding: 0,
                                                                            }}
                                                                        >
                                                                            <ListItemIcon></ListItemIcon>
                                                                            <Box
                                                                                width="100%"
                                                                                display="flex"
                                                                                alignItems="center"
                                                                                justifyContent="space-between"
                                                                                sx={{
                                                                                    p: 1,
                                                                                    background:
                                                                                        index %
                                                                                            2 ===
                                                                                        0
                                                                                            ? "#F9F9F9"
                                                                                            : "#fff",
                                                                                }}
                                                                            >
                                                                                <ListItemIcon>
                                                                                    <Checkbox
                                                                                        checked={
                                                                                            selectedItems.findIndex(
                                                                                                (
                                                                                                    selectedItem
                                                                                                ) =>
                                                                                                    selectedItem.id ===
                                                                                                    member._id
                                                                                            ) !==
                                                                                            -1
                                                                                        }
                                                                                        onChange={() =>
                                                                                            handleGroupOrMemberClick(
                                                                                                {
                                                                                                    group: member.group,
                                                                                                    id: member._id,
                                                                                                    name: `${member.user.firstname} ${member.user.lastname}`,
                                                                                                    organization:
                                                                                                        member
                                                                                                            .user
                                                                                                            .organization,
                                                                                                    role: member.role,

                                                                                                    subName:
                                                                                                        member.email,
                                                                                                    type: "member",
                                                                                                }
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </ListItemIcon>
                                                                                <ListItemText
                                                                                    secondaryTypographyProps={{
                                                                                        fontSize: 12,
                                                                                    }}
                                                                                    primary={
                                                                                        member
                                                                                            .user
                                                                                            .firstname +
                                                                                        " " +
                                                                                        member
                                                                                            .user
                                                                                            .lastname +
                                                                                        ` (${member.user.organization})`
                                                                                    }
                                                                                    secondary={
                                                                                        member.email
                                                                                    }
                                                                                />
                                                                                <span
                                                                                    style={{
                                                                                        fontSize: 12,
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        member.role
                                                                                    }
                                                                                </span>
                                                                            </Box>
                                                                        </ListItem>
                                                                    );
                                                                }
                                                            )
                                                    }
                                                </>
                                            );
                                        })}
                                </List>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                <Box p={1} display="flex" justifyContent="end">
                    <Stack direction="row" spacing={1}>
                        {" "}
                        <Button
                            onClick={onClose}
                            color="neutral"
                            variant="contained"
                        >
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleSend}>
                            Send
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Modal>
    );
};

export default ResendAlertModal;
