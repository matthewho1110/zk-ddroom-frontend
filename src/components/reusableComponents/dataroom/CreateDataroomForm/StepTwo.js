// MUI components
import { Typography, Button } from "@mui/material";

// Custom Components
import DataroomForm from "../../../reusableComponents/dataroom/DataroomForm";
import lange from "@i18n";

const StepTwo = ({ contract, active, onNextStep, onPrevStep }) => {
    return (
        <DataroomForm
            contract={contract}
            visible={active}
            onSubmit={onNextStep}
            submitText="Next"
            showCancelButton={false}
            customButton={
                <Button
                    variant="contained"
                    color="neutral"
                    sx={{
                        p: "0.5rem 1rem",
                        fontSize: "1rem",
                        fontWeight: 600,
                    }}
                    onClick={onPrevStep}
                >
                    <Typography variant="body1">{lange("Back")}</Typography>
                </Button>
            }
        />
    );
};
export default StepTwo;
