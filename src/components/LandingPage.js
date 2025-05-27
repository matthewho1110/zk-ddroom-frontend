// internal modules
import useAlert from "../hooks/useAlert";
import styles from "./LandingPage.module.scss";
import { Style1OutlinedInput } from "./reusableComponents/Input";
import { validateEmail } from "../utils/inputValidator";

// external modules
import axios from "axios";
import Head from "next/head";
import Image from "next/image";

// mui components
import SendIcon from "@mui/icons-material/Send";
import { CircularProgress, IconButton, InputAdornment } from "@mui/material";

// Change
import { useState } from "react";

const STATUSES = {
    IDLE: 0,
    EMAIL_SENDING: 1,
};

function LandingPage() {
    const { setAlert } = useAlert();
    const [email, setEmail] = useState("");

    const [status, setStatus] = useState(STATUSES.IDLE);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async () => {
        const body = {
            email: email,
        };

        if (validateEmail(email) == false) {
            setAlert("Invalid email address", "warning");

            return;
        }

        setStatus(STATUSES.EMAIL_SENDING);

        try {
            await axios.post(
                `${process.env.BACKEND_URI}/register/sendEmail`,
                body,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setAlert(
                "Verification email has been sent to your mailbox, please follow the specified instructions.",
                "success"
            );
            setEmail("");
            setStatus(STATUSES.IDLE);
        } catch (err) {
            console.log(err);
            if (err.response) {
                switch (err.response.status) {
                    case 405:
                        setAlert(
                            "Email has already been registered, please login to continue",
                            "warning"
                        );
                        break;
                    default:
                        setAlert(
                            "System Error, please try again later.",
                            "error"
                        );
                        break;
                }
                // Request made and server responded with error
            } else if (err.request) {
                // The request was made but no response was received
            } else {
                setAlert("System Error, please try again later.", "error");
            }
            setStatus(STATUSES.IDLE);
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Drta dataroom</title>
                <meta
                    name="description"
                    content="Drta dataroom, Powered by Starwave"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <h1 className={styles.title}>
                    Increase your success rate by{" "}
                    <span className="text-primary">5x times</span>
                    <br />
                    with <a href="/">DDroom</a>
                </h1>

                <div className={styles.description}>
                    <p>Enter your company email to start&nbsp;&nbsp;</p>

                    <Style1OutlinedInput
                        value={email}
                        sx={{
                            "& legend": { display: "none" },
                            "& fieldset": { top: 0 },
                            width: "15rem",
                        }}
                        InputLabelProps={{ shrink: false }}
                        onChange={handleEmailChange}
                        onKeyUp={(e) => {
                            if (e.key == "Enter") {
                                handleSubmit();
                            }
                        }}
                        placeholder="E.g. dd@starwave.com"
                        InputProps={{
                            endAdornment:
                                email == "" ? null : (
                                    <InputAdornment position="end">
                                        {status == STATUSES.IDLE ? (
                                            <IconButton
                                                disableRipple
                                                className={
                                                    styles.emailSubmitButton
                                                }
                                                onClick={handleSubmit}
                                            >
                                                <SendIcon />
                                            </IconButton>
                                        ) : (
                                            <CircularProgress size={20} />
                                        )}
                                    </InputAdornment>
                                ),
                        }}
                    />
                </div>
                <code className={styles.code}>
                    Upon successful verification, our expert will get in touch
                    with you very shortly
                </code>

                <div className={styles.grid}>
                    <a href="/" className={styles.card}>
                        <h2>Features &rarr;</h2>
                        <p>Check out our competitive edges</p>
                    </a>

                    <a href="/" className={styles.card}>
                        <h2>Pricing &rarr;</h2>
                        <p>Learn about our flexible pricing plans </p>
                    </a>

                    <a href="/" className={styles.card}>
                        <h2>Enquiry &rarr;</h2>
                        <p>24/7 online chat with our experts</p>
                    </a>

                    <a href="/login" className={styles.card}>
                        <h2>Login &rarr;</h2>
                        <p>Already have an account? login</p>
                    </a>
                </div>
            </main>
            <footer className={styles.footer}>
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-flex flex-row align-items-center h-100"
                >
                    Powered by DDroom
                    <Image
                        src="/images/logo.svg"
                        alt="drta Logo"
                        width={35}
                        height={20}
                    />
                </a>
            </footer>
        </div>
    );
}

export default LandingPage;
