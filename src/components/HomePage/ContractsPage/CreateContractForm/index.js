// import custom hooks
import useAlert from "../../../../hooks/useAlert";
import useUser from "../../../../hooks/useUser";

// import custom components
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";

// import custom utils

// import mui components
import styled from "@emotion/styled";
import { Box, CircularProgress, IconButton } from "@mui/material";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CloseIcon from "@mui/icons-material/Close";

// import external hooks
import { useRouter } from "next/router";
import { useState } from "react";
import lange from "@i18n";

const steps = ["Enter_contract_details", "Confirmation", "Submit"];

function CreateContractForm({ onClose }) {
    const router = useRouter();
    const { setAlert } = useAlert();
    const { axiosInstance } = useUser();
    const [activeStep, setActiveStep] = useState(0);
    const [contract, setContract] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleStepOneFinish = (data) => {
        setContract(data);
        setActiveStep(1);
    };

    const handleSubmit = async () => {
        const options = {};
        try {
            setSubmitting(true);
            const contractId = (
                await axiosInstance.post("/contracts", contract, options)
            ).data._id;
            setAlert("Contract created successfully", "success");
            router.push(`/contracts/${contractId}`);
        } catch (err) {
            if (err.response?.status === 409) {
                setAlert("Existing contract ID", "warning");
            } else {
                setAlert(
                    "System Error. Please check the details and try again later",
                    "error"
                );
            }

            setActiveStep(0);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: "white",
                borderRadius: "1rem",
                px: 5,
                py: 5,
                m: "5% auto",
                width: "80%",
                maxWidth: 1240,
                position: "relative",
            }}
        >
            <Stepper alternativeLabel activeStep={activeStep}>
                {steps.map((label) => {
                    const stepProps = {};
                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel>{lange(label)}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            <StepOne
                active={activeStep == 0}
                onNextStep={handleStepOneFinish}
            />

            <StepTwo
                active={activeStep == 1}
                contract={contract}
                onPrevStep={() => setActiveStep(0)}
                onNextStep={() => {
                    setActiveStep(2);
                    handleSubmit();
                }}
            />

            {activeStep == 2 && submitting && (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="30vh"
                >
                    <CircularProgress size={56} />
                </Box>
            )}
            {activeStep != 2 && !submitting && (
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: "1rem",
                        top: "1rem",
                    }}
                >
                    <CloseIcon />
                </IconButton>
            )}
        </Box>
    );
}

export default CreateContractForm;
