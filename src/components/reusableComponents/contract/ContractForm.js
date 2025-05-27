// MUI components
import {
    Box,
    Grid,
    TextField,
    MenuItem,
    FormLabel,
    Stack,
    Switch,
    InputAdornment,
    Button,
    Typography,
    CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers-pro";

// Custom utils
import {
    emailYupSchema,
    contractIdYupSchema,
    contractDescriptionYupSchema,
    contractOrganizationYupSchema,
    contractMaxStorageYupSchema,
    contractMaxDataroomsYupSchema,
    dateYupSchema,
} from "../../../utils/inputValidator";
import {
    bytesToGb,
    gbToBytes,
    formatFileSize,
} from "../../../utils/fileHelper";

// External modules
import { Formik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import lange from "@i18n";

const ContractForm = ({
    visible = true,
    contract,
    onSubmit,
    submitText,
    showCancelButton = false,
}) => {
    let maxStorageSchema = contractMaxStorageYupSchema;
    let maxDataroomsSchema = contractMaxDataroomsYupSchema;

    if (contract) {
        maxStorageSchema = maxStorageSchema.min(
            bytesToGb(contract?.allocatedStorage),
            `Max storage must be greater than allocated storage - ${formatFileSize(
                contract?.allocatedStorage
            )}`
        );
        maxDataroomsSchema = maxDataroomsSchema.min(
            contract?.createdDatarooms,
            `Max datarooms must be greater than created datarooms - ${contract?.createdDatarooms}`
        );
    }

    const INITIAL_VALUES = {
        id: contract?.id || "",
        status: contract?.status || "",
        managerEmail: contract?.managerEmail || "",
        description: contract?.description || "",
        organization: contract?.organization || "",
        maxStorage: bytesToGb(contract?.maxStorage),
        maxDatarooms: contract?.maxDatarooms,
        hasMaxStorage: contract?.maxStorage
            ? contract?.maxStorage != -1
            : false,
        hasMaxDatarooms: contract?.maxDatarooms
            ? contract?.maxDatarooms != -1
            : false,
        signAt: contract?.signAt ? dayjs(contract?.signAt) : null,
        startAt: contract?.startAt ? dayjs(contract?.startAt) : null,
        expireAt: contract?.expireAt ? dayjs(contract?.expireAt) : null,
    };

    const contractSchema = Yup.object().shape({
        id: contractIdYupSchema,
        description: contractDescriptionYupSchema,
        organization: contractOrganizationYupSchema,

        maxStorage: Yup.mixed()
            .nullable(true)
            .when("hasMaxStorage", {
                is: true,
                then: () => maxStorageSchema,
            }),
        maxDatarooms: Yup.mixed()
            .nullable(true)
            .when("hasMaxDatarooms", {
                is: true,
                then: () => maxDataroomsSchema,
            }),
        managerEmail: emailYupSchema,
        signAt: dateYupSchema
            .max(
                Yup.ref("startAt", "Start date"),
                "Sign date must be before start date"
            )
            .required("Sign date is required"),
        startAt: dateYupSchema
            .min(
                Yup.ref("signAt", "Sign date"),
                "Start date must be after sign date"
            )
            .max(
                Yup.ref("expireAt", "Expire date"),
                "Start date must be before expire date"
            )
            .required("Start date is required"),
        expireAt: dateYupSchema
            .min(
                Yup.ref("startAt", "Start date"),
                "Expire date must be after start date"
            )
            .required("Expire date is required"),
    });
    const handleSubmit = async (values) => {
        await onSubmit({
            id: values.id,
            managerEmail: values.managerEmail || null,
            status: values.status,
            description: values.description,
            organization: values.organization,
            maxStorage: values.hasMaxStorage
                ? gbToBytes(values.maxStorage)
                : -1,
            maxDatarooms: values.hasMaxDatarooms ? values.maxDatarooms : -1,
            signAt: new Date(values.signAt),
            startAt: new Date(values.startAt),
            expireAt: new Date(values.expireAt + 24 * 60 * 60 * 1000),
        });
    };

    return (
        <Formik
            onSubmit={handleSubmit}
            initialValues={INITIAL_VALUES}
            validationSchema={contractSchema}
            validateOnChange={false}
            enableReinitialize={true}
        >
            {({
                handleSubmit,
                handleReset,
                values,
                handleChange,
                handleBlur,
                isSubmitting,
                setFieldValue,
                errors,
                touched,
                dirty,
            }) => {
                if (!visible) return null;

                return (
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        onReset={handleReset}
                    >
                        <Grid container spacing={3} sx={{ mb: 2 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label={lange("Contract", "ID")}
                                    id="id"
                                    name="id"
                                    required
                                    fullWidth
                                    variant="standard"
                                    error={Boolean(errors.id)}
                                    helperText={errors.id}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.id}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label={lange("Status")}
                                    id="status"
                                    name="status"
                                    select
                                    required
                                    fullWidth
                                    variant="standard"
                                    error={Boolean(errors.status)}
                                    helperText={errors.status}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.status}
                                >
                                    <MenuItem value="Active">
                                        {lange("Active")}
                                    </MenuItem>
                                    <MenuItem value="Inactive">
                                        {lange("Inactive")}
                                    </MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label={lange("Manager", "Email")}
                                    id="managerEmail"
                                    name="managerEmail"
                                    fullWidth
                                    variant="standard"
                                    error={Boolean(errors.managerEmail)}
                                    helperText={errors.managerEmail}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.managerEmail}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label={lange("Organization")}
                                    id="organization"
                                    name="organization"
                                    required
                                    fullWidth
                                    variant="standard"
                                    error={Boolean(errors.organization)}
                                    helperText={errors.organization}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.organization}
                                />
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
                                        error={
                                            values.hasMaxStorage &&
                                            Boolean(errors.maxStorage)
                                        }
                                        helperText={
                                            values.hasMaxStorage &&
                                            errors.maxStorage
                                        }
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.maxStorage}
                                    />
                                    <Switch
                                        checked={values.hasMaxStorage}
                                        onChange={handleChange}
                                        name="hasMaxStorage"
                                    ></Switch>
                                </Stack>
                                {contract && (
                                    <Typography variant="caption">
                                        {lange("Allocated_Storage")} :{" "}
                                        {formatFileSize(
                                            contract?.allocatedStorage
                                        )}
                                    </Typography>
                                )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormLabel component="legend">
                                    {lange("Max", "Dataroom")}
                                </FormLabel>
                                <Stack direction="row" mt={1}>
                                    <TextField
                                        id="maxDatarooms"
                                        name="maxDatarooms"
                                        type={"number"}
                                        sx={{
                                            display: values.hasMaxDatarooms
                                                ? "block"
                                                : "none",
                                        }}
                                        inputProps={{
                                            step: "1",
                                        }}
                                        required={values.hasMaxDatarooms}
                                        variant="outlined"
                                        error={
                                            values.hasMaxDatarooms &&
                                            Boolean(errors.maxDatarooms)
                                        }
                                        helperText={
                                            values.hasMaxDatarooms &&
                                            errors.maxDatarooms
                                        }
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        value={values.maxDatarooms}
                                    />

                                    <Switch
                                        checked={values.hasMaxDatarooms}
                                        onChange={handleChange}
                                        name="hasMaxDatarooms"
                                    ></Switch>
                                </Stack>
                                {contract && (
                                    <Typography variant="caption">
                                        {lange("Created", "Dataroom")} :{" "}
                                        {contract?.createdDatarooms}
                                    </Typography>
                                )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label={lange("Sign_Date")}
                                    disableFuture
                                    sx={{ width: "100%" }}
                                    maxDate={values.startAt}
                                    name="signAt"
                                    value={values.signAt}
                                    onChange={(newValue) => {
                                        setFieldValue("signAt", newValue);
                                    }}
                                    slotProps={{
                                        textField: {
                                            required: true,
                                            error:
                                                touched.signAt &&
                                                Boolean(errors.signAt),
                                            helperText:
                                                touched.signAt && errors.signAt,
                                            onBlur: handleBlur,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid
                                item
                                xs={12}
                                md={6}
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <DatePicker
                                    label={lange("Start_Date")}
                                    name="startAt"
                                    value={values.startAt}
                                    minDate={values.signAt}
                                    maxDate={values.expireAt}
                                    onChange={(newValue) => {
                                        setFieldValue("startAt", newValue);
                                    }}
                                    slotProps={{
                                        textField: {
                                            required: true,
                                            error:
                                                touched.startAt &&
                                                Boolean(errors.startAt),
                                            helperText:
                                                touched.startAt &&
                                                errors.startAt,
                                            onBlur: handleBlur,
                                        },
                                    }}
                                />

                                <DatePicker
                                    label={lange("Expire_Date")}
                                    name="expireAt"
                                    value={values.expireAt}
                                    minDate={values.startAt}
                                    onChange={(newValue) => {
                                        setFieldValue("expireAt", newValue);
                                    }}
                                    slotProps={{
                                        textField: {
                                            required: true,
                                            error:
                                                touched.expireAt &&
                                                Boolean(errors.expireAt),
                                            helperText:
                                                touched.expireAt &&
                                                errors.expireAt,
                                            onBlur: handleBlur,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label={lange("Description")}
                                    id="description"
                                    name="description"
                                    multiline
                                    rows={3}
                                    required
                                    fullWidth
                                    variant="outlined"
                                    error={Boolean(errors.description)}
                                    helperText={errors.description}
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.description}
                                />
                            </Grid>
                        </Grid>

                        <Stack
                            direction="row"
                            spacing={2}
                            justifyContent="flex-end"
                        >
                            {showCancelButton && dirty && !isSubmitting && (
                                <Button
                                    variant="contained"
                                    color="neutral"
                                    type="reset"
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
                                {isSubmitting ? (
                                    <CircularProgress
                                        size={18}
                                        color="secondary"
                                    />
                                ) : (
                                    <Typography variant="body1">
                                        {lange(submitText)}
                                    </Typography>
                                )}
                            </Button>
                        </Stack>
                    </Box>
                );
            }}
        </Formik>
    );
};

export default ContractForm;
