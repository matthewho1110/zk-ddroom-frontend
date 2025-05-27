import {
    Box,
    Button,
    CircularProgress,
    InputLabel,
    MenuItem,
    TextField,
    Typography,
    Stack,
    Card,
    Tooltip,
    InputAdornment,
    IconButton,
    CardActionArea,
} from "@mui/material";

import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DoneIcon from "@mui/icons-material/Done";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

import styled from "@emotion/styled";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
// Cancel Icon
import CancelIcon from "@mui/icons-material/Cancel";

import axios from "axios";
import { memo, useEffect, useState } from "react";
import useAlert from "../../../hooks/useAlert";
import useUser from "../../../hooks/useUser";
import { emailYupSchema } from "../../../utils/inputValidator";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { ROLES } from "../../../configs/roleConfig";
import * as yup from "yup";
import RoleDescriptionTable from "./RoleDescriptionTable";
import lange from "@i18n";
const GroupSelect = styled(TextField)({
    "& .MuiInputBase-input.MuiFilledInput-input": {
        padding: "0.8rem 1rem",
    },
});

const EmailTextField = styled(TextField)({
    "& .MuiInputBase-root.MuiFilledInput-root": {
        width: "100%",
        height: "100%",
    },
    "& .MuiInputBase-input.MuiFilledInput-input": {
        padding: "0.8rem 1rem",
    },
});
const INITIAL_INVITEES = { email: "", group: "", role: "" };
const STATUS_BGCOLOR = {
    success: "primary.main",
    failed: "error.main",
    duplicate: "warning.main",
};

function InviteMemberForm({
    existingEmails,
    assignableRoles,
    groups,
    dataroomId,
    onInvitationSuccess,
    onClose,
}) {
    const { setAlert, alertHandler } = useAlert();
    const [group, setGroup] = useState("");
    const [invitees, setInvitees] = useState(INITIAL_INVITEES);
    const [inviteesChild, setInviteesChild] = useState([]);
    const [errorMsg, setErrorMsg] = useState({});
    const [loading, setLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const { logout, axiosInstance } = useUser();
    const [roleTableOpen, setRoleTableOpen] = useState(false);

    const newMemberSchema = yup
        .object()
        .shape({
            email: emailYupSchema.required(),
        })
        .required();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(newMemberSchema),
    });

    useEffect(() => {
        setErrorMsg(errors.email);
    }, [errors?.email]);

    const handleEmailInput = (event) => {
        const { value } = event.target;
        setInvitees({
            ...invitees,
            email: value,
        });
        setValue("email", value);
        setErrorMsg({});
    };

    const handleSelectGroup = (event) => {
        setInvitees({
            ...invitees,
            group: event.target.value,
        });

        setGroup(event.target.value);
    };

    const handleSelectRole = (_role) => {
        setRoleTableOpen(false);
        setInvitees({
            ...invitees,
            role: _role,
        });
    };

    const handleSubmitInvitations = async (e) => {
        let inviteesList = inviteesChild.filter((res) => !res.status);

        if (!inviteesList.length || loading) {
            return;
        }

        setLoading(true);

        try {
            const { data = {}, status } = await axiosInstance.post(
                `${process.env.BACKEND_URI}/datarooms/${dataroomId}/members`,
                {
                    invitees: inviteesList,
                },
                {
                    validateStatus: (status) => status < 500 && status !== 401,
                }
            );
            const { success = [], failed = [], duplicate = [] } = data;
            let _inviteesChild = inviteesList.map((res) => {
                if (success.findIndex((item) => item === res.email) != -1) {
                    return { ...res, status: "success" };
                }
                if (duplicate.findIndex((item) => item === res.email) != -1) {
                    return { ...res, status: "duplicate" };
                }
                if (failed.findIndex((item) => item === res.email) != -1) {
                    return { ...res, status: "failed" };
                }
            });
            onInvitationSuccess();
            setIsDisabled(true);
            setInviteesChild(_inviteesChild);

            setAlert("Invitation sent successfully.", "success");
        } catch (error) {
            setAlert("Encountered an error while sending invitations", "error");
        }

        setLoading(false);
    };

    const handleAddChild = (e) => {
        if (
            inviteesChild.findIndex((item) => item.email === invitees.email) !=
                -1 ||
            existingEmails.includes(invitees.email)
        ) {
            setErrorMsg({ message: "Email already exists" });
            return;
        }
        setInviteesChild((prevState) => [
            ...prevState,
            {
                ...invitees,
            },
        ]);
        setInvitees((prevState) => ({
            ...prevState,
            email: "",
        }));
    };

    const removeInviteeChild = (index) => {
        let _inviteesChild = [...inviteesChild];
        _inviteesChild.splice(index, 1);
        setInviteesChild(_inviteesChild);
    };

    return (
        <Box
            padding={2}
            my={5}
            mx="auto"
            width="75%"
            maxWidth={1240}
            borderRadius={2}
            backgroundColor="white"
            display="flex"
            flexDirection="column"
            component="form"
            // onSubmit={handleSubmitInvitations}
            onSubmit={handleSubmit(handleAddChild)}
        >
            {roleTableOpen && (
                <RoleDescriptionTable
                    roles={assignableRoles}
                    onClick={handleSelectRole}
                    onReturn={() => setRoleTableOpen(false)}
                />
            )}
            {!roleTableOpen && (
                <>
                    <Box padding="2rem 0" height="50vh" overflow="auto">
                        {!isDisabled && (
                            <Box
                                display="flex"
                                direction="row"
                                width="100%"
                                mb={5}
                                alignItems="center"
                                sx={{
                                    pointerEvents: loading ? "none" : "all",
                                    "& .MuiFormHelperText-root": {
                                        position: "absolute",
                                        bottom: "-1.3rem",
                                    },
                                }}
                            >
                                <EmailTextField
                                    {...register("email")}
                                    placeholder="Fill in invitee's email then press enter"
                                    variant="filled"
                                    size="small"
                                    required
                                    error={!!errorMsg?.message}
                                    value={invitees.email}
                                    helperText={
                                        errorMsg?.message ||
                                        `Press "Enter" to add a new invitee`
                                    }
                                    name={"email"}
                                    sx={{
                                        width: "60%",
                                        mr: 2,
                                    }}
                                    onChange={handleEmailInput}
                                    // handleSubmit={handleAddChild}
                                >
                                    <InputLabel id="demo-simple-select-label">
                                        Email
                                    </InputLabel>
                                </EmailTextField>

                                <GroupSelect
                                    id="group-select"
                                    value={invitees.group}
                                    select
                                    required
                                    variant="outlined"
                                    sx={{
                                        width: "30%",
                                        mr: 2,
                                    }}
                                    name={"group"}
                                    label="Group"
                                    onChange={handleSelectGroup}
                                >
                                    {groups
                                        .filter(
                                            (group) =>
                                                group.name != "Owner" &&
                                                group._id != "ALL"
                                        )
                                        .map((group) => (
                                            <MenuItem
                                                value={group._id}
                                                key={group._id}
                                            >
                                                {group.name}
                                            </MenuItem>
                                        ))}
                                </GroupSelect>

                                <GroupSelect
                                    id="role-select"
                                    value={invitees.role}
                                    select
                                    required
                                    variant="outlined"
                                    sx={{
                                        mr: 1,
                                        width: "30%",
                                        height: "100%",
                                    }}
                                    name={"role"}
                                    label="Role"
                                    onChange={(e) =>
                                        handleSelectRole(e.target.value)
                                    }
                                >
                                    {assignableRoles.map((role) => (
                                        <MenuItem value={role} key={role}>
                                            {role}
                                        </MenuItem>
                                    ))}
                                </GroupSelect>

                                <ZoomInRoundedIcon
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setRoleTableOpen(true);
                                    }}
                                />
                            </Box>
                        )}

                        <Box
                            display="flex"
                            sx={{ padding: "0 10px", flexWrap: "wrap" }}
                        >
                            {inviteesChild.map((res, index) => {
                                return (
                                    <Tooltip
                                        title={
                                            res.status == "success"
                                                ? "Invitation sent"
                                                : res.status == "duplicate"
                                                ? "Duplicate email"
                                                : res.status == "failed"
                                                ? "Failed to send invitation"
                                                : "Remove"
                                        }
                                    >
                                        <Card
                                            key={index}
                                            sx={{
                                                padding: "10px",
                                                backgroundColor: res.status
                                                    ? STATUS_BGCOLOR[res.status]
                                                    : "gray",
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginRight: "10px",
                                                marginBottom: "10px",
                                                typography: "body1",
                                                color: "white",
                                            }}
                                        >
                                            <Stack
                                                direction="column"
                                                spacing={1}
                                            >
                                                <span>{res.email}</span>

                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                >
                                                    <Typography variant="caption">
                                                        {
                                                            groups.find(
                                                                (group) =>
                                                                    group._id ==
                                                                    res.group
                                                            ).name
                                                        }
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        {res.role}
                                                    </Typography>
                                                </Stack>
                                            </Stack>

                                            {res.status == "success" && (
                                                <DoneIcon sx={{ ml: 2 }} />
                                            )}

                                            {res.status == "duplicate" && (
                                                <PeopleAltIcon sx={{ ml: 2 }} />
                                            )}

                                            {res.status == "failed" && (
                                                <PriorityHighIcon
                                                    sx={{ ml: 2 }}
                                                />
                                            )}

                                            {!res.status && (
                                                <CloseIcon
                                                    sx={{
                                                        ml: 2,
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                        removeInviteeChild(
                                                            index
                                                        )
                                                    }
                                                />
                                            )}
                                        </Card>
                                    </Tooltip>
                                );
                            })}
                            {!isDisabled && (
                                <Button
                                    sx={{
                                        padding: "10px",
                                        marginRight: "10px",
                                        marginBottom: "10px",
                                    }}
                                    type="submit"
                                >
                                    <AddIcon />
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Stack
                        width="100%"
                        spacing={1}
                        alignItems="center"
                        justifyContent="center"
                        direction="column"
                    >
                        <Button
                            sx={{
                                width: "0",
                                height: "0",
                            }}
                            type="submit"
                        ></Button>
                        {!isDisabled && (
                            <Button
                                variant="contained"
                                fullWidth
                                disabled={!inviteesChild.length}
                                onClick={handleSubmitInvitations}
                            >
                                {loading && (
                                    <CircularProgress
                                        size={18}
                                        color="secondary"
                                    />
                                )}
                                {!loading && (
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <SendIcon />
                                        <Typography>Send Invitation</Typography>
                                    </Stack>
                                )}
                            </Button>
                        )}

                        {!loading && (
                            <Button
                                variant="contained"
                                color="neutral"
                                onClick={onClose}
                                fullWidth
                            >
                                {isDisabled ? lange("Confirm") : lange("Back")}
                            </Button>
                        )}
                    </Stack>
                </>
            )}
        </Box>
    );
}

export default memo(InviteMemberForm);
