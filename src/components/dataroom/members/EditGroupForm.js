import {
    Box,
    Stack,
    Button,
    Checkbox,
    CircularProgress,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";

import styled from "@emotion/styled";

import axios from "axios";
import { useEffect, useState } from "react";
import useAlert from "../../../hooks/useAlert";
import useUser from "../../../hooks/useUser";
import lange from "@i18n";

// custom hooks
import useConfirmationDialog from "../../../hooks/useConfirmationDialog";

import { DATAROOM_PERMISSIONS } from "../../../configs/permissionConfig";

const RolePermissionCheckbox = ({
    name,
    permissionName,
    enabled,
    onChange,
    groups,
}) => {
    return (
        <Box display="flex" flexDirection="row" alignItems="center">
            <Typography>{permissionName}</Typography>
            <Checkbox name={name} checked={enabled} onChange={onChange} />
        </Box>
    );
};

const RoleSelect = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        fontWeight: "regular",
    },

    "& .MuiFormLabel-root.MuiInputLabel-root": {
        transform: "translate(1rem, 0.5rem) scale(1)",
    },

    "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
        transform: "translate(1rem, -0.5rem) scale(0.8)",
    },

    "& .MuiFormLabel-root.MuiInputLabel-root.Mui-focused": {
        transform: "translate(1rem, -0.5rem) scale(0.8)",
    },

    "& .MuiInputBase-input": {
        padding: "0.8rem 1rem",
    },
});

const INITAL_STATE = {
    name: "",
    ...Object.keys(DATAROOM_PERMISSIONS).reduce((acc, permission) => {
        acc[permission] = false;
        return acc;
    }, {}),
    viewableGroups: [],
};

function EditGroupForm({
    dataroomId,
    group,
    onEditSuccess,
    onAddSuccess,
    onDeleteSuccess,
    availableGroups,
}) {
    const [state, setState] = useState({
        ...INITAL_STATE,
        name: group ? group.name : "New Group " + (availableGroups.length + 1),
        ...Object.keys(DATAROOM_PERMISSIONS).reduce((acc, permission) => {
            acc[permission] = group?.[permission] || false;
            return acc;
        }, {}),
        viewableGroups: group?.viewableGroups || [],
    });

    // Hooks
    const { setConfirmationDialog } = useConfirmationDialog();
    const { axiosInstance } = useUser();
    const { setAlert, alertHandler } = useAlert();

    const handleDeleteGroup = async () => {
        try {
            await axiosInstance.delete(
                `${process.env.BACKEND_URI}/datarooms/${dataroomId}/groups/${group._id}`
            );
            setAlert("Group deleted successfully", "success");
            onDeleteSuccess(group._id);
        } catch (err) {
            alertHandler(err, {
                409: {
                    text: "Unable to delete a group with members, please move all members to another group first",
                },
            });
        }
    };

    const handleChangeName = (e) => {
        setState((prevState) => ({
            ...prevState,
            name: e.target.value,
        }));
    };

    // const handleChangePermission = (e) => {
    //     setState((prevState) => ({
    //         ...prevState,
    //         [e.target.name]: e.target.checked,
    //     }));
    // };

    // const handleSelectViewableGroup = (e) => {
    //     console.log(e.target.value);
    //     setState((prevState) => ({
    //         ...prevState,
    //         viewableGroups: e.target.value,
    //     }));
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!group) {
                // create new group
                const newGroup = (
                    await axiosInstance.post(
                        `${process.env.BACKEND_URI}/datarooms/${dataroomId}/groups`,
                        state
                    )
                ).data;

                onAddSuccess(newGroup);
                setAlert("Group created successfully", "success");
            } else {
                // update group
                const updatedGroup = (
                    await axiosInstance.patch(
                        `${process.env.BACKEND_URI}/datarooms/${dataroomId}/groups/${group._id}`,
                        state
                    )
                ).data;
                onEditSuccess(updatedGroup);
                setAlert("Group updated successfully", "success");
            }
        } catch (err) {
            if (err.response?.status == 400) {
                setAlert("Invalid Group Name", "warning");
            } else if (err.response?.status == 403) {
                setAlert("You are not authorized to do this", "warning");
            } else if (err.response.status == 409) {
                setAlert("Duplicate Group Name", "warning");
            } else {
                setAlert("Unknown System Error", "error");
            }
        }
    };

    return (
        <Box
            padding={2}
            margin="10vh auto"
            width="30%"
            borderRadius={2}
            backgroundColor="white"
            display="flex"
            flexDirection="column"
            component="form"
            onSubmit={handleSubmit}
        >
            <Typography variant="h4">
                {group ? lange("Edit") + " " + group.name : lange("Add_New_Group")}
            </Typography>
            <Box display="flex" flexDirection="column" my={2} height="100%">
                <TextField
                    fullWidth
                    label={lange("Group", "Name")}
                    variant="outlined"
                    size="small"
                    name="groupName"
                    value={state.name}
                    required
                    onChange={handleChangeName}
                    sx={{
                        my: 3,
                    }}
                />
                {/* <RoleSelect
                    id="role-select"
                    value={state.role}
                    label="Role"
                    select
                    onChange={handleChangeRole}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    name="role"
                    disabled={state.role == 0}
                >
                    {Object.keys(DATAROOM_PERMISSIONS).map((role) => (
                        <MenuItem value={role} key={role} disabled={role == 0}>
                            {DATAROOM_PERMISSIONS[role].name}
                        </MenuItem>
                    ))}
                </RoleSelect> */}
                {/* <Typography variant="h4" sx={{ my: 2, textAlign: "center" }}>
                    Dataroom Permissions
                </Typography>
                <Box
                    display="flex"
                    flexDirection="row"
                    flexWrap="wrap"
                    justifyContent="center"
                >
                    {Object.keys(DATAROOM_PERMISSIONS).map((permission) => (
                        <RolePermissionCheckbox
                            name={permission}
                            permissionName={
                                DATAROOM_PERMISSIONS[permission].name
                            }
                            enabled={state[permission]}
                            key={permission}
                            onChange={handleChangePermission}
                        />
                    ))}
                </Box> */}

                {/* {state.canViewMembers && (
                    <Box
                        display="flex"
                        flexDirection="row"
                        flexWrap="wrap"
                        justifyContent="center"
                    >
                        <Typography
                            variant="h4"
                            sx={{ my: 2, textAlign: "center" }}
                        >
                            Viewable Member Groups
                        </Typography>
                        <TextField
                            select
                            SelectProps={{
                                multiple: true,
                            }}
                            value={state.viewableGroups}
                            onChange={handleSelectViewableGroup}
                            fullWidth
                        >
                            {availableGroups.map((group) => {
                                return (
                                    <MenuItem value={group._id}>
                                        {group.name}
                                    </MenuItem>
                                );
                            })}
                        </TextField>
                    </Box>
                )} */}

                <Typography variant="h4" sx={{ my: 2, textAlign: "center" }}>
                    {lange("File", "Permissions")}
                </Typography>
                <Typography
                    variant="h6"
                    color="primary"
                    sx={{
                        my: 2,
                        textAlign: "center",
                        borderRadius: 2,
                        padding: 1,
                    }}
                >
                    {group ? (
                        <code>{lange("Edit_Group_tip")}</code>
                    ) : (
                        <code>{lange("Add_Group_tip")}</code>
                    )}
                </Typography>
            </Box>
            <Stack
                width="100%"
                alignItems="flex-end"
                justifyContent="center"
                spacing={1}
            >
                {true ? (
                    <Button variant="contained" fullWidth type="submit">
                        {group ? lange("Save") : lange("Add")}
                    </Button>
                ) : (
                    <CircularProgress size={28} />
                )}

                {
                    // if group is not null, then we are editing an existing group
                    group && (
                        <Button
                            variant="contained"
                            fullWidth
                            color="error"
                            onClick={() => {
                                setConfirmationDialog({
                                    title: lange("Delete", "Group"),
                                    description: lange("Delete_Group_Title"),
                                    onConfirm: handleDeleteGroup,
                                    onCancel: () => { },
                                });
                            }}
                        >
                            {lange("Delete", "Group")}
                        </Button>
                    )
                }
            </Stack>
        </Box>
    );
}

export default EditGroupForm;
