import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

// Custom Hooks
import useUser from "../../../hooks/useUser";
import useAlert from "../../../hooks/useAlert";

// MUI Components
import styled from "@emotion/styled";
import { Stack, Button, Box, Typography, Link, Modal } from "@mui/material";

const WelcomeContent = () => {
    const [open, setOpen] = useState(false);
    const { axiosInstance, isLoggedIn } = useUser();
    const { setAlert } = useAlert();
    const router = useRouter();

    const { did } = router.query;
    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const { data: dataroomData, mutate: mutateDataroomData } = useSWR(
        did && isLoggedIn ? `/datarooms/${did}` : null,
        fetcher
    );

    const handleCancel = () => {
        setOpen(false);
        router.push("/datarooms");
        setAlert(
            "You are not allowed to access the dataroom before agreed to the terms",
            "warning"
        );
    };

    const handleAgree = async () => {
        if (!did || !dataroomData?.memberId) return;
        try {
            await axiosInstance.patch(
                `/datarooms/${did}/members/${dataroomData?.memberId}/activate`
            );
            setOpen(false);
            setAlert(
                "Dataroom activation success. You can now view the dataroom.",
                "success"
            );
            mutateDataroomData();
        } catch (err) {
            console.log(err);
            setAlert(
                "Dataroom activation failed. Contact our support team if the problem persists.",
                "error"
            );
        }
    };

    useEffect(() => {
        if (dataroomData) {
            const { active } = dataroomData;
            if (!active) {
                setOpen(true);
            }
        }
    }, [dataroomData]);

    return (
        <Modal open={open}>
            <Stack
                direction="column"
                spacing={3}
                sx={{
                    backgroundColor: "white",
                    borderRadius: "1rem",
                    p: 5,
                    m: "2% auto",
                    width: "80%",
                    maxWidth: 1240,
                }}
            >
                <img src="/images/logo.png" width="18%" />
                <Typography variant="h4" sx={{ fontWeight: 550 }}>
                    Welcome to {dataroomData?.dataroom.name}
                </Typography>
                <Stack
                    spacing={2}
                    sx={{
                        typography: "h6",
                        maxHeight: "50vh",
                        overflow: "auto",
                    }}
                >
                    <div>
                        The information contained in this exchange (Exchange
                        Data") is confidential.
                    </div>
                    <div>
                        By clicking "agree”, you acknowledge and agree to
                        strictly maintain the confidentiality of all Exchange
                        Data, and agree to take normal and reasonable
                        precautions to maintain such confidentiality so that you
                        do not{" "}
                        <strong>
                            divulge Exchange Data to any third party
                        </strong>
                        .
                    </div>
                    <div>
                        In addition, the Exchange Data may be protected under
                        the terms of a confidentiality agreement between
                        you/your company and the party who has furnished such
                        information, and in such case this click-wrap agreement
                        does not supersede or replace any terms of such
                        confidentiality agreement.
                    </div>
                    <div>You also agree NOT to:</div>
                    <ul>
                        <li>Share your username & password</li>
                        <li>
                            Share information with persons not part of your
                            transaction team
                        </li>
                        <li>
                            Willingly attempt to disable the protection software
                            associated with this site
                        </li>
                    </ul>

                    <div>
                        If you have any questions regarding this service or
                        require technical support, please contact DDRoom 24/7
                        support team for assistance:
                    </div>
                    <div>
                        E-mail: <Link href="#">support@ddroom.io</Link>
                    </div>
                </Stack>
                <Stack
                    spacing={2}
                    direction="row"
                    justifyContent="flex-end"
                    sx={{ marginTop: "20px", width: "100%" }}
                >
                    <Button variant="outlined" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleAgree}>
                        Agree
                    </Button>
                </Stack>
            </Stack>
        </Modal>
    );
};

export default WelcomeContent;
