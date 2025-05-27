// import custom hooks
import useAlert from "../../../../hooks/useAlert";
import useUser from "../../../../hooks/useUser";

// import custom components
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";

// import mui components
import { Box, CircularProgress, IconButton } from "@mui/material";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CloseIcon from "@mui/icons-material/Close";

// import external hooks
import { useRouter } from "next/router";
import { useState } from "react";

const steps = ["Select a contract", "Enter dataroom details ", "Submit"];

function CreateDataroomForm({ onClose }) {
    // Hooks
    const router = useRouter();
    const { setAlert } = useAlert();
    const { axiosInstance } = useUser();

    // States
    const [activeStep, setActiveStep] = useState(0);
    const [contract, setContract] = useState({});
    const [dataroom, setDataroom] = useState({});

    const [submitting, setSubmitting] = useState(false);

    const handleStepOneFinish = (data) => {
        setContract(data);
        setActiveStep(1);
    };

    const handleStepTwoFinish = (data) => {
        setDataroom(data);
        setActiveStep(2);
        handleSubmit(data);
    };

    const handleSubmit = async (dataroom) => {
        const options = {};
        try {
            setSubmitting(true);
            const dataroomId = (
                await axiosInstance.post(
                    process.env.BACKEND_URI + "/datarooms",
                    dataroom,
                    options
                )
            ).data.id;
            setAlert("Dataroom created successfully", "success");
            router.push(
                `/dataroom/${dataroomId}/files?filePath=${encodeURIComponent(
                    "/root"
                )}`
            );
        } catch (err) {
            if (err.response?.status === 409) {
                setAlert("Existing dataroom name", "warning");
            } else {
                setAlert("System Error. Please try again later", "error");
            }
            setActiveStep(1);
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
                m: "10vh auto",
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
                            <StepLabel>{label}</StepLabel>
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
                onNextStep={handleStepTwoFinish}
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

export default CreateDataroomForm;
