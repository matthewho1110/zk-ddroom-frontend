// MUI components
import {
    Box,
    Typography,
    Grid,
    Button,
    TextField,
    MenuItem,
    InputAdornment,
    CircularProgress,
    Checkbox,
} from "@mui/material";

// Custom Components
import DataroomForm from "../../../reusableComponents/dataroom/DataroomForm";

// Custom modules
import {
    dataroomNameYupSchema,
    dataroomDescriptionYupSchema,
    dataroomOrganizationYupSchema,
    dataroomPhaseYupSchema,
    dataroomStorageYupSchema,
} from "../../../../utils/inputValidator";
import { bytesToGb, gbToBytes } from "../../../../utils/fileHelper";

// External modules
import { Form, Formik } from "formik";
import * as Yup from "yup";

// Custom configs
import { PHASES } from "../../../../configs/dataroomConfig";
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
