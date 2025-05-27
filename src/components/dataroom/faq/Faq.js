import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
    Box,
    Button,
    IconButton,
    Modal,
    Stack,
    Grid,
    Divider,
} from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import useSWR from "swr";
import useUser from "../../../hooks/useUser";
import { useRouter } from "next/router";
import FAQForm from "./FAQForm";
import { useState } from "react";
import { ROLES } from "../../../configs/roleConfig";
import useDataroom from "../../../hooks/useDataroom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import lange from "@i18n";
import { isMobile } from "react-device-detect";

const FAQ_FORM_STATUSES = {
    CLOSED: "CLOSED",
    ADD: "ADD",
    EDIT: "EDIT",
    VIEW: "VIEW",
};
const Faq = () => {
    const router = useRouter();
    const { did } = router.query;
    const { axiosInstance } = useUser();
    // State Variables
    const [faqForm, setFAQForm] = useState({
        status: FAQ_FORM_STATUSES.CLOSED,
    });
    const [openList, setOpenList] = useState([]);

    // Get the required
    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const { data: faqs, mutate: mutateFaqs } = useSWR(
        did ? `/datarooms/${did}/faqs` : null,
        fetcher
    );
    const { data: dataroomData } = useSWR(
        did ? `/datarooms/${did}` : null,
        fetcher
    );

    const handleAccordion = (value, faqId) => {
        if (value) {
            setOpenList(openList.concat(faqId));
        } else {
            let _openList = [...openList];
            _openList.splice(
                openList.findIndex((res) => res === faqId),
                1
            );
            setOpenList(_openList);
        }
    };

    const canManageFAQ = ROLES[dataroomData?.role]?.canManageFAQ == true;
    return (
        <Box
            p={isMobile ? 0 : 6}
            width="100%"
            minHeight="100vh"
            pt={isMobile ? 2 : 6}
        >
            <Stack
                direction="row"
                justifyContent={isMobile ? "center" : "space-between"}
                alignItems="center"
                mb={2}
            >
                <Box display="flex" flexDirection="column">
                    {!isMobile && (
                        <Typography variant="h3">
                            {lange("Frequently_Asked_Questions")}
                        </Typography>
                    )}
                    <Typography
                        variant="h6"
                        color="neutral.main"
                        sx={{ mb: 2 }}
                    >
                        {lange("FAQ_Tips")}
                    </Typography>
                </Box>

                {canManageFAQ == true && !isMobile && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setFAQForm({
                                status: FAQ_FORM_STATUSES.ADD,
                            });
                        }}
                        startIcon={<AddIcon />}
                    >
                        {lange("Add_New_FAQ")}
                    </Button>
                )}
            </Stack>

            <Grid
                container
                spacing={2}
                justify="space-between"
                alignItems="stretch"
            >
                {faqs?.map((faq) => {
                    const isOpen =
                        openList.findIndex((res) => res === faq._id) != -1;
                    return (
                        <Grid item xs={12} key={faq._id}>
                            <Accordion
                                square
                                sx={{
                                    p: 1,
                                    backgroundColor: isOpen
                                        ? "var(--dark-blue)"
                                        : "#fff",
                                    color: isOpen ? "#fff" : "rgb(30, 35, 41)",
                                }}
                                onChange={(e, value) =>
                                    handleAccordion(value, faq._id)
                                }
                            >
                                <AccordionSummary
                                    expandIcon={
                                        <ExpandMoreIcon
                                            sx={{
                                                color: isOpen
                                                    ? "#fff"
                                                    : "rgb(30, 35, 41)",
                                            }}
                                        />
                                    }
                                >
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <Typography variant="h6">
                                            {faq.question}
                                        </Typography>
                                        {canManageFAQ == true && (
                                            <IconButton
                                                sx={{
                                                    color: isOpen
                                                        ? "#fff"
                                                        : "rgb(30, 35, 41)",
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFAQForm({
                                                        status:
                                                            canManageFAQ == true
                                                                ? FAQ_FORM_STATUSES.EDIT
                                                                : FAQ_FORM_STATUSES.VIEW,
                                                        faq,
                                                    });
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                </AccordionSummary>

                                <AccordionDetails>
                                    <Typography
                                        variant="body1"
                                        color={isOpen ? "#fff" : "neutral.dark"}
                                    >
                                        {faq.answer}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    );
                })}
            </Grid>

            {faqs?.length == 0 && (
                <Box
                    width="100%"
                    display="flex"
                    height="100%"
                    minHeight="65vh"
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                >
                    <img
                        alt="test"
                        width="30%"
                        src={"/images/empty/emptyFaq.svg"}
                    />
                    <Typography variant="h5" color="neutral.main">
                        {lange("FAQ_Empty")}{" "}
                        <span
                            className="link-btn"
                            onClick={() => {
                                router.push(`/dataroom/${did}/qa/list`);
                            }}
                        >
                            Q & A
                        </span>
                    </Typography>
                </Box>
            )}
            <Modal
                open={faqForm.status != FAQ_FORM_STATUSES.CLOSED}
                onClose={() =>
                    setFAQForm({
                        faq: null,
                        status: FAQ_FORM_STATUSES.CLOSED,
                    })
                }
            >
                <FAQForm
                    dataroomId={did}
                    faq={faqForm.faq}
                    status={faqForm.status}
                    onDeleteSuccess={() => {
                        setFAQForm({
                            status: FAQ_FORM_STATUSES.CLOSED,
                            faq: null,
                        });
                        mutateFaqs();
                    }}
                    onEditSuccess={() => {
                        setFAQForm({
                            status: FAQ_FORM_STATUSES.CLOSED,
                            faq: null,
                        });
                        mutateFaqs();
                    }}
                    onAddSuccess={() => {
                        setFAQForm({
                            status: FAQ_FORM_STATUSES.CLOSED,
                            faq: null,
                        });
                        mutateFaqs();
                    }}
                />
            </Modal>
        </Box>
    );
};

export default Faq;
