import { Box, Typography, Grid, Button } from "@mui/material";

// Custom conponents
import { ContractPreview } from "../../../reusableComponents/contract";
import lange from "@i18n";

// id: values.id,
//             managerEmail: values.managerEmail,
//             status: values.status,
//             description: values.description,
//             organization: values.organization,
//             maxStorage: values.hasMaxStorage ? values.maxStorage : Infinity,
//             maxDatarooms: values.hasMaxDatarooms
//                 ? values.maxDatarooms
//                 : Infinity,
//             signAt: new Date(values.signAt),
//             startAt: new Date(values.startAt),
//             expireAt: new Date(values.expireAt + 24 * 60 * 60 * 1000),
const StepTwo = ({ active, contract, onNextStep, onPrevStep }) => {
    if (!active) return null;
    return (
        <Box mt={5}>
            <ContractPreview contract={contract} />
            <Box
                display="flex"
                justifyContent="flex-end"
                flexDirection="row"
                gap={2}
            >
                <Button
                    variant="contained"
                    onClick={onPrevStep}
                    color="neutral"
                    sx={{
                        p: "0.5rem 1rem",
                        fontSize: "1rem",
                        fontWeight: 600,
                    }}
                >
                    <Typography variant="body1">{lange("Back")}</Typography>
                </Button>
                <Button
                    variant="contained"
                    onClick={onNextStep}
                    sx={{
                        p: "0.5rem 1rem",
                        fontSize: "1rem",
                        fontWeight: 600,
                    }}
                >
                    <Typography variant="body1">{lange("Submit")}</Typography>
                </Button>
            </Box>
        </Box>
    );
};
export default StepTwo;
