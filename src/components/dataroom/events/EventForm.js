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

import useDataroom from "../../../hooks/useDataroom";

import styled from "@emotion/styled";

import axios from "axios";
import { useEffect, useState } from "react";
import useAlert from "../../../hooks/useAlert";
import useUser from "../../../hooks/useUser";
import { useQuery } from "@tanstack/react-query";

// custom hooks
import useConfirmationDialog from "../../../hooks/useConfirmationDialog";

const INITAL_STATE = {
    title: "",
    description: "",
    viewableGroups: [],
};

function EditEventForm({
    status,
    dataroomId,
    event,
    onAddSuccess,
    onEditSuccess,
    onDeleteSuccess,
}) {
    // hooks
    const { setConfirmationDialog } = useConfirmationDialog();
    const [state, setState] = useState({
        ...INITAL_STATE,
        title: event?.title || "",
        description: event?.description || "",
        viewableGroups: event?.viewableGroups || [],
        date: new Date(event?.date).toDateString() || "",
    });

    const editDisabled = ["EDIT", "ADD"].includes(status) == false;

    const { axiosInstance } = useUser();
    const { setAlert, alertHandler } = useAlert();

    const { isLoading, isError, data, refetch, error } = useQuery(
        ["listGroups", dataroomId],
        () => {
            return axiosInstance.get(
                `datarooms/${dataroomId}/groups?includeAdmin=false&includeOwnGroup=true`
            );
        },
        {
            enabled: !!dataroomId,
        }
    );
    // console.log("groups", data);
    let availableGroups = data?.data;
    const handleDeleteEvent = async () => {
        try {
            await axiosInstance.delete(
                `${process.env.BACKEND_URI}/datarooms/${dataroomId}/events/${event.id}`
            );
            setAlert("Event deleted successfully", "success");
            onDeleteSuccess();
        } catch (err) {
            alertHandler(err, {});
        }
    };

    const handleChangeTitle = (e) => {
        setState((prevState) => ({ ...prevState, title: e.target.value }));
    };

    const handleChangeDescription = (e) => {
        setState((prevState) => ({
            ...prevState,
            description: e.target.value,
        }));
    };
    const handleSelectViewableGroup = (e) => {
        // console.log(e.target.value);
        setState((prevState) => ({
            ...prevState,
            viewableGroups: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!event?.id) {
                // create new group
                // console.log(state);
                const newEvent = (
                    await axiosInstance.post(
                        `${process.env.BACKEND_URI}/datarooms/${dataroomId}/events`,
                        {
                            ...state,
                            date: event.date,
                        }
                    )
                ).data;

                onAddSuccess();
                // console.log(newEvent);
                setAlert("Event created successfully", "success");
            } else {
                // update event
                const updatedEvent = (
                    await axiosInstance.patch(
                        `${process.env.BACKEND_URI}/datarooms/${dataroomId}/events/${event.id}`,
                        state
                    )
                ).data;
                onEditSuccess();
                setAlert("Event updated successfully", "success");
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status == 400) {
                    setAlert(err.response.data.message, "error");
                    return;
                } else if (err.response.status == 403) {
                    setAlert("You are not authorized to do this", "warning");
                    return;
                }
            }
            setAlert("Unknown System Error", "error");
            // console.log(err);
        }
    };

    return (
        <Box
            margin="10vh auto"
            width="30%"
            p={2}
            borderRadius={2}
            backgroundColor="white"
            display="flex"
            flexDirection="column"
            component="form"
            onSubmit={handleSubmit}
        >
            <Typography variant="h4" sx={{ mb: 4 }}>
                {status == "VIEW" && "Event "}
                {status == "EDIT" && "Edit Event "}
                {status == "ADD" && "Add New Event "}
                on {state.date}
            </Typography>

            <Box display="flex" flexDirection="column" gap={2} height="100%">
                <TextField
                    fullWidth
                    label="Event Title"
                    variant="outlined"
                    size="small"
                    name="title"
                    required
                    value={state.title}
                    onChange={handleChangeTitle}
                    disabled={editDisabled}
                />
                <TextField
                    fullWidth
                    required
                    label="Event Description"
                    variant="outlined"
                    size="small"
                    name="description"
                    value={state.description}
                    onChange={handleChangeDescription}
                    disabled={editDisabled}
                />
                {editDisabled == false &&
                    availableGroups &&
                    availableGroups.length > 0 && (
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
                    )}
            </Box>
            {editDisabled == false && (
                <Stack
                    width="100%"
                    alignItems="flex-end"
                    justifyContent="center"
                    marginTop={2}
                    spacing={1}
                >
                    {
                        // if group is not null, then we are editing an existing group
                        event?.id && (
                            <Button
                                variant="contained"
                                fullWidth
                                color="error"
                                onClick={() => {
                                    setConfirmationDialog({
                                        title: "Delete Event",
                                        description:
                                            "Are you sure you want to delete this event?",
                                        onConfirm: handleDeleteEvent,
                                        onCancel: () => {},
                                    });
                                }}
                            >
                                Delete Event
                            </Button>
                        )
                    }

                    {true ? (
                        <Button variant="contained" fullWidth type="submit">
                            {event?.id ? "Save" : "Add"}
                        </Button>
                    ) : (
                        <CircularProgress size={28} />
                    )}
                </Stack>
            )}
        </Box>
    );
}

export default EditEventForm;
