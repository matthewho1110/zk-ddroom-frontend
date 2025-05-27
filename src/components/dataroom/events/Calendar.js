// * @fullcalendar/react need to be imported first
import FullCalendar, { formatDate } from "@fullcalendar/react";
import { useRouter } from "next/router";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
    Box,
    List,
    ListItem,
    ListItemText,
    Modal,
    Paper,
    Typography,
} from "@mui/material";
import { useState } from "react";
import styled from "@emotion/styled";
import Header from "../dashboard/Header";
import { useQuery } from "@tanstack/react-query";
import useUser from "../../../hooks/useUser";
import useDataroom from "../../../hooks/useDataroom";
import { ROLES } from "../../../configs/roleConfig";
import EventForm from "./EventForm";
import lange from "@i18n";

const EventCalenderDiv = styled.div`
    .fc-button:focus {
        box-shadow: none !important;
    }
    .fc .fc-daygrid-day.fc-day-today {
        background-color: #0b042921 !important;
        text-decoration: underline;
    }

    .fc .fc-daygrid-event {
        background: #1e90ff;
        text-align: center;
    }
`;

const EVENT_FORM_STATUSES = {
    CLOSED: "CLOSED",
    ADD: "ADD",
    EDIT: "EDIT",
    VIEW: "VIEW",
};

const Calendar = ({ dataroomId }) => {
    const { logout, axiosInstance } = useUser();
    const { dataroomInfo } = useDataroom();

    const canManageEvents = ROLES[dataroomInfo?.role]?.canManageEvents === true;
    const router = useRouter();
    const { did } = router.query;
    const [eventForm, setEventForm] = useState({
        status: EVENT_FORM_STATUSES.CLOSED,
    });
    const { isLoading, isError, data, refetch, error } = useQuery(
        ["listEvents", did],
        () => {
            return axiosInstance.get(`datarooms/${did}/events`);
        },
        {
            enabled: !!did,
        }
    );
    // console.log("kazaf data", data);
    let currentEvents = data?.data?.map((event) => {
        return {
            id: event._id,
            allDay: true,
            ...event,
        };
    });
    // const [currentEvents, setCurrentEvents] = useState([]);

    const handleDateClick = (selected) => {
        if (canManageEvents != true) {
            return;
        }
        setEventForm({
            status: EVENT_FORM_STATUSES.ADD,
            event: { date: selected.startStr },
        });
    };

    const handleEventClick = (selected) => {
        // console.log("kazaf id", selected.event.id);
        // console.log("kazaf title", selected.event.title);
        // console.log("kazaf description", selected.event.description);
        setEventForm({
            status:
                canManageEvents == true
                    ? EVENT_FORM_STATUSES.EDIT
                    : EVENT_FORM_STATUSES.VIEW,
            event: currentEvents.find((event) => event.id == selected.event.id),
        });
    };

    return (
        <Box display="flex" justifyContent="space-between">
            {/* CALENDAR SIDEBAR */}
            <Box flex="1 1 20%" p="15px" borderRadius="4px" component={Paper}>
                <Typography variant="h5">{lange("Events")}</Typography>
                <List>
                    {currentEvents?.map((event) => (
                        <ListItem
                            key={event.id}
                            sx={{
                                backgroundColor: "primary.main",

                                margin: "10px 0",
                                borderRadius: "2px",
                                color: "white",
                            }}
                            onClick={() =>
                                handleEventClick({
                                    event,
                                })
                            }
                        >
                            <ListItemText
                                primary={event.title}
                                secondary={
                                    <Typography>
                                        {formatDate(event.start, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* CALENDAR */}
            <Box flex="1 1 100%" ml="15px">
                <EventCalenderDiv>
                    <FullCalendar
                        height="75vh"
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                            listPlugin,
                        ]}
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,listMonth",
                        }}
                        initialView="dayGridMonth"
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        select={handleDateClick}
                        eventClick={handleEventClick}
                        events={currentEvents}
                    />
                </EventCalenderDiv>
            </Box>
            <Modal
                open={eventForm.status != EVENT_FORM_STATUSES.CLOSED}
                onClose={() =>
                    setEventForm({
                        event: null,
                        status: EVENT_FORM_STATUSES.CLOSED,
                    })
                }
            >
                <EventForm
                    dataroomId={did}
                    event={eventForm.event}
                    status={eventForm.status}
                    onDeleteSuccess={() => {
                        setEventForm({
                            status: EVENT_FORM_STATUSES.CLOSED,
                            event: null,
                        });
                        refetch();
                    }}
                    onEditSuccess={() => {
                        setEventForm({
                            status: EVENT_FORM_STATUSES.CLOSED,
                            event: null,
                        });
                        refetch();
                    }}
                    onAddSuccess={() => {
                        setEventForm({
                            status: EVENT_FORM_STATUSES.CLOSED,
                            event: null,
                        });
                        refetch();
                    }}
                />
            </Modal>
        </Box>
    );
};

export default Calendar;
