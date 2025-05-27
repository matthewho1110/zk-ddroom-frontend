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
    FormLabel,
    Stack,
    Switch,
} from "@mui/material";

// Custom modules
import {
    dataroomNameYupSchema,
    dataroomDescriptionYupSchema,
    dataroomOrganizationYupSchema,
    dataroomPhaseYupSchema,
    dataroomStorageYupSchema,
} from "../../../utils/inputValidator";

import { bytesToGb, gbToBytes } from "../../../utils/fileHelper";

// External modules
import { Form, Formik } from "formik";
import * as Yup from "yup";
import lange from "@i18n";

// Custom configs
import { PHASES } from "../../../configs/dataroomConfig";

const DataroomForm = ({
    dataroom,
    contract,
    onSubmit,
    visible,
    submitText = "Submit",
    showCancelButton = false,
    customButton = null,
}) => {
    const unlimitedContractStorage = contract?.maxStorage == -1;
    const contractRemainingStorage = bytesToGb(
        contract?.maxStorage -
        contract?.allocatedStorage +
        (dataroom?.maxStorage
            ? dataroom?.maxStorage == -1
                ? 0
                : dataroom?.maxStorage
            : 0)
    );
    const usedStorage = bytesToGb(dataroom?.usedStorage);

    let maxStorageSchema = dataroomStorageYupSchema;

    !unlimitedContractStorage &&
        (maxStorageSchema = maxStorageSchema.max(
            contractRemainingStorage,
            `Max storage cannot exceed contract's remaining storage: ${contractRemainingStorage} GB`
        ));

    dataroom &&
        (maxStorageSchema = maxStorageSchema.min(
            usedStorage,
            `Max storage must be greater than used storage - ${usedStorage} GB`
        ));

    const storageHelperText = () => {
        let text = "";
        dataroom && (text += `Used storage - ${usedStorage} GB | `);

        text += `Contract remaining storage: ${unlimitedContractStorage
            ? "Unlimited"
            : contractRemainingStorage + " GB"
            }`;
        return text;
    };

    const dataroomSchema = Yup.object().shape({
        name: dataroomNameYupSchema,
        description: dataroomDescriptionYupSchema,
        organization: dataroomOrganizationYupSchema,
        phase: dataroomPhaseYupSchema,
        maxStorage: Yup.mixed()
            .nullable(true)
            .when("hasMaxStorage", {
                is: true,
                then: () => maxStorageSchema,
            }),
        hasMaxStorage: Yup.boolean(),
    });

    const handleSubmit = (values) => {
        onSubmit({
            contractId: contract?._id,
            name: values.name,
            description: values.description,
            organization: values.organization,
            phase: values.phase,
            maxStorage: values.hasMaxStorage
                ? gbToBytes(values.maxStorage)
                : -1,
        });
    };

    return (
        <Formik
            onSubmit={handleSubmit}
            initialValues={{
                name: dataroom?.name || "",
                description: dataroom?.description || "",
                organization: dataroom?.organization || "",
                phase: dataroom?.phase || "",
                maxStorage: bytesToGb(dataroom?.maxStorage),
                hasMaxStorage:
                    dataroom == null
                        ? !unlimitedContractStorage
                        : dataroom?.maxStorage != -1,
            }}
            enableReinitialize={true}
            validationSchema={dataroomSchema}
            validateOnChange={false}
        >
            {({
                handleSubmit,
                handleReset,
                values,
                handleChange,
                handleBlur,
                errors,
                dirty,
            }) => {
                if (visible == false) return null;
                return (
                    <Box
                        mt={3}
                        component="form"
                        onSubmit={handleSubmit}
                        onReset={handleReset}
                    >
                        <Grid container spacing={3} sx={{ mb: 2 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    type="text"
                                    label={lange("Contract", "ID")}
                                    id="contractId"
                                    name="contractId"
                                    value={contract?.id}
                                    fullWidth
                                    required
                                    variant="standard"
                                    disabled={true}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    type="text"
                                    label={lange("Name")}
                                    id="name"
                                    name="name"
                                    value={values.name}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="standard"
                                    error={Boolean(errors.name)}
                                    helperText={errors.name}
                                    onBlur={handleBlur}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    type="text"
                                    multiline
                                    value={values.description}
                                    label={lange("Description")}
                                    id="description"
                                    name="description"
                                    fullWidth
                                    required
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(errors.description)}
                                    helperText={errors.description}
                                    variant="standard"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    type="text"
                                    multiline
                                    label={lange("Organization")}
                                    id="organization"
                                    name="organization"
                                    value={values.organization}
                                    fullWidth
                                    required
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(errors.organization)}
                                    helperText={errors.organization}
                                    variant="standard"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    label={lange("Current", "Phase")}
                                    id="phase"
                                    name="phase"
                                    fullWidth
                                    value={values.phase}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(errors.phase)}
                                    helperText={errors.phase}
                                    variant="standard"
                                >
                                    {PHASES.map((phase) => (
                                        <MenuItem value={phase} key={phase}>
                                            {lange(phase)}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormLabel component="legend">
                                    {lange("Max_Storage")}
                                </FormLabel>
                                <Stack direction="row" mt={1}>
                                    <TextField
                                        id="maxStorage"
                                        name="maxStorage"
                                        type={"number"}
                                        inputProps={{
                                            step: "0.1",
                                        }}
                                        sx={{
                                            display: values.hasMaxStorage
                                                ? "block"
                                                : "none",
                                        }}
                                        required={values.hasMaxStorage}
                                        variant="outlined"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    GB
                                                </InputAdornment>
                                            ),
                                        }}
                                        error={Boolean(errors.maxStorage)}
                                        helperText={errors.maxStorage}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.maxStorage}
                                    />
                                    <Switch
                                        checked={values.hasMaxStorage}
                                        onChange={(e) => {
                                            if (!unlimitedContractStorage)
                                                return;
                                            handleChange(e);
                                        }}
                                        disabled={!unlimitedContractStorage}
                                        name="hasMaxStorage"
                                    ></Switch>
                                </Stack>
                                <Typography variant="caption">
                                    {storageHelperText()}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Box
                            display="flex"
                            justifyContent="flex-end"
                            flexDirection="row"
                            gap={2}
                        >
                            {customButton}
                            {showCancelButton && dirty && (
                                <Button
                                    variant="contained"
                                    type="reset"
                                    color="neutral"
                                    sx={{
                                        p: "0.5rem 1rem",
                                        fontSize: "1rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    <Typography variant="body1">
                                        {lange("Cancel")}
                                    </Typography>
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                type="submit"
                                sx={{
                                    p: "0.5rem 1rem",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                }}
                                disabled={!dirty}
                            >
                                <Typography variant="body1">
                                    {lange(submitText)}
                                </Typography>
                            </Button>
                        </Box>
                    </Box>
                );
            }}
        </Formik>
    );
};

export default DataroomForm;
