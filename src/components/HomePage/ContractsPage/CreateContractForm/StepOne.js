// MUI components
import {
    TextField,
    Grid,
    Button,
    Typography,
    CircularProgress,
    InputAdornment,
    Checkbox,
    MenuItem,
    Box,
    FormLabel,
    FormControlLabel,
    Stack,
    Switch,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers-pro";
import { Form, Formik } from "formik";
import * as Yup from "yup";

// Custom utils
import {
    emailYupSchema,
    contractIdYupSchema,
    contractDescriptionYupSchema,
    contractOrganizationYupSchema,
    contractMaxStorageYupSchema,
    contractMaxDataroomsYupSchema,
    dateYupSchema,
} from "../../../../utils/inputValidator";
import { gbToBytes } from "../../../../utils/fileHelper";

// Custom Components
import ContractForm from "../../../reusableComponents/contract/ContractForm";

const contractSchema = Yup.object().shape({
    id: contractIdYupSchema,
    description: contractDescriptionYupSchema,
    organization: contractOrganizationYupSchema,
    maxStorage: contractMaxStorageYupSchema,
    maxDatarooms: contractMaxDataroomsYupSchema,
    managerEmail: emailYupSchema,
    signAt: dateYupSchema.max(new Date(), "Sign date must be in the past"),
    startAt: dateYupSchema.min(
        Yup.ref("signAt", "Sign date"),
        "Start date must be after sign date"
    ),
    expireAt: dateYupSchema.min(
        Yup.ref("startAt", "Start date"),
        "Expire date must be after start date"
    ),
});

const StepOne = ({ active, onNextStep }) => {
    return (
        <ContractForm
            onSubmit={onNextStep}
            submitText="Next"
            visible={active}
        />
    );

    // return (
    //     <Formik
    //         onSubmit={handleSubmit}
    //         initialValues={{
    //             id: "",
    //             status: "",
    //             managerEmail: "",
    //             description: "",
    //             organization: "",
    //             maxStorage: 0,
    //             maxDatarooms: 0,
    //             hasMaxStorage: false,
    //             hasMaxDatarooms: false,
    //             signAt: null,
    //             startAt: null,
    //             expireAt: null,
    //         }}
    //         validationSchema={contractSchema}
    //         validateOnChange={false}
    //     >
    //         {({
    //             handleSubmit,
    //             values,
    //             handleChange,
    //             handleBlur,
    //             isSubmitting,
    //             setFieldValue,
    //             touched,
    //             setFieldTouched,
    //             errors,
    //         }) => {
    //             console.log(touched);
    //             if (!active) return null;
    //             return (
    //                 <Box mt={3} component="form" onSubmit={handleSubmit}>
    //                     <Grid container spacing={3} sx={{ mb: 2 }}>
    //                         <Grid item xs={12} md={6}>
    //                             <TextField
    //                                 label="Contract ID"
    //                                 id="id"
    //                                 name="id"
    //                                 required
    //                                 fullWidth
    //                                 variant="standard"
    //                                 error={Boolean(errors.id)}
    //                                 helperText={errors.id}
    //                                 onBlur={handleBlur}
    //                                 onChange={handleChange}
    //                                 value={values.id}
    //                             />
    //                         </Grid>

    //                         <Grid item xs={12} md={6}>
    //                             <TextField
    //                                 label="Status"
    //                                 id="status"
    //                                 name="status"
    //                                 select
    //                                 required
    //                                 fullWidth
    //                                 variant="standard"
    //                                 error={Boolean(errors.status)}
    //                                 helperText={errors.status}
    //                                 onBlur={handleBlur}
    //                                 onChange={handleChange}
    //                                 value={values.status}
    //                             >
    //                                 <MenuItem value="Active">Active</MenuItem>
    //                                 <MenuItem value="Inactive">
    //                                     Inactive
    //                                 </MenuItem>
    //                             </TextField>
    //                         </Grid>

    //                         <Grid item xs={12} md={6}>
    //                             <TextField
    //                                 label="Manager Email"
    //                                 id="managerEmail"
    //                                 name="managerEmail"
    //                                 required
    //                                 fullWidth
    //                                 variant="standard"
    //                                 error={Boolean(errors.managerEmail)}
    //                                 helperText={errors.managerEmail}
    //                                 onBlur={handleBlur}
    //                                 onChange={handleChange}
    //                                 value={values.managerEmail}
    //                             />
    //                         </Grid>

    //                         <Grid item xs={12} md={6}>
    //                             <TextField
    //                                 label="Organization"
    //                                 id="organization"
    //                                 name="organization"
    //                                 required
    //                                 fullWidth
    //                                 variant="standard"
    //                                 error={Boolean(errors.organization)}
    //                                 helperText={errors.organization}
    //                                 onBlur={handleBlur}
    //                                 onChange={handleChange}
    //                                 value={values.organization}
    //                             />
    //                         </Grid>
    //                         <Grid item xs={12} md={6}>
    //                             <FormLabel component="legend">
    //                                 Max Storage
    //                             </FormLabel>
    //                             <Stack direction="row" mt={1}>
    //                                 <TextField
    //                                     id="maxStorage"
    //                                     name="maxStorage"
    //                                     type={"number"}
    //                                     inputProps={{
    //                                         step: "0.1",
    //                                     }}
    //                                     sx={{
    //                                         display: values.hasMaxStorage
    //                                             ? "block"
    //                                             : "none",
    //                                     }}
    //                                     required={values.hasMaxStorage}
    //                                     variant="outlined"
    //                                     InputProps={{
    //                                         endAdornment: (
    //                                             <InputAdornment position="end">
    //                                                 GB
    //                                             </InputAdornment>
    //                                         ),
    //                                     }}
    //                                     error={
    //                                         values.hasMaxStorage &&
    //                                         Boolean(errors.maxStorage)
    //                                     }
    //                                     helperText={
    //                                         values.hasMaxStorage &&
    //                                         errors.maxStorage
    //                                     }
    //                                     onBlur={handleBlur}
    //                                     onChange={handleChange}
    //                                     value={values.maxStorage}
    //                                 />
    //                                 <Switch
    //                                     checked={values.hasMaxStorage}
    //                                     onChange={handleChange}
    //                                     name="hasMaxStorage"
    //                                 ></Switch>
    //                             </Stack>
    //                         </Grid>

    //                         <Grid item xs={12} md={6}>
    //                             <FormLabel component="legend">
    //                                 Max Datarooms
    //                             </FormLabel>
    //                             <Stack direction="row" mt={1}>
    //                                 <TextField
    //                                     id="maxDatarooms"
    //                                     name="maxDatarooms"
    //                                     type={"number"}
    //                                     sx={{
    //                                         display: values.hasMaxDatarooms
    //                                             ? "block"
    //                                             : "none",
    //                                     }}
    //                                     inputProps={{
    //                                         step: "1",
    //                                     }}
    //                                     required={values.hasMaxDatarooms}
    //                                     variant="outlined"
    //                                     error={
    //                                         values.hasMaxDatarooms &&
    //                                         Boolean(errors.maxDatarooms)
    //                                     }
    //                                     helperText={
    //                                         values.hasMaxDatarooms &&
    //                                         errors.maxDatarooms
    //                                     }
    //                                     onBlur={handleBlur}
    //                                     onChange={handleChange}
    //                                     value={values.maxDatarooms}
    //                                 />

    //                                 <Switch
    //                                     checked={values.hasMaxDatarooms}
    //                                     onChange={handleChange}
    //                                     name="hasMaxDatarooms"
    //                                 ></Switch>
    //                             </Stack>
    //                         </Grid>

    //                         <Grid item xs={12} md={6}>
    //                             <DatePicker
    //                                 label="Sign Date"
    //                                 disableFuture
    //                                 sx={{ width: "100%" }}
    //                                 maxDate={values.startAt}
    //                                 name="signAt"
    //                                 value={values.signAt}
    //                                 onChange={(newValue) => {
    //                                     setFieldValue("signAt", newValue);
    //                                 }}
    //                                 slotProps={{
    //                                     textField: {
    //                                         required: true,
    //                                         error:
    //                                             touched.signAt &&
    //                                             Boolean(errors.signAt),
    //                                         helperText:
    //                                             touched.signAt && errors.signAt,
    //                                         onBlur: handleBlur,
    //                                     },
    //                                 }}
    //                             />
    //                         </Grid>

    //                         <Grid
    //                             item
    //                             xs={12}
    //                             md={6}
    //                             sx={{
    //                                 display: "flex",
    //                                 flexDirection: "row",
    //                                 alignItems: "center",
    //                                 gap: 2,
    //                             }}
    //                         >
    //                             <DatePicker
    //                                 label="Start Date"
    //                                 name="startAt"
    //                                 value={values.startAt}
    //                                 minDate={values.signAt}
    //                                 maxDate={values.expireAt}
    //                                 onChange={(newValue) => {
    //                                     setFieldValue("startAt", newValue);
    //                                 }}
    //                                 slotProps={{
    //                                     textField: {
    //                                         required: true,
    //                                         error:
    //                                             touched.startAt &&
    //                                             Boolean(errors.startAt),
    //                                         helperText:
    //                                             touched.startAt &&
    //                                             errors.startAt,
    //                                         onBlur: handleBlur,
    //                                     },
    //                                 }}
    //                             />

    //                             <DatePicker
    //                                 label="Expire Date"
    //                                 name="expireAt"
    //                                 value={values.expireAt}
    //                                 minDate={values.startAt}
    //                                 onChange={(newValue) => {
    //                                     setFieldValue("expireAt", newValue);
    //                                 }}
    //                                 slotProps={{
    //                                     textField: {
    //                                         required: true,
    //                                         error:
    //                                             touched.expireAt &&
    //                                             Boolean(errors.expireAt),
    //                                         helperText:
    //                                             touched.expireAt &&
    //                                             errors.expireAt,
    //                                         onBlur: handleBlur,
    //                                     },
    //                                 }}
    //                             />
    //                         </Grid>

    //                         <Grid item xs={12}>
    //                             <TextField
    //                                 label="Description"
    //                                 id="description"
    //                                 name="description"
    //                                 multiline
    //                                 rows={3}
    //                                 required
    //                                 fullWidth
    //                                 variant="outlined"
    //                                 error={Boolean(errors.description)}
    //                                 helperText={errors.description}
    //                                 onBlur={handleBlur}
    //                                 onChange={handleChange}
    //                                 value={values.description}
    //                             />
    //                         </Grid>
    //                     </Grid>

    //                     <Box display="flex" justifyContent="flex-end">
    //                         <Button
    //                             variant="contained"
    //                             type="submit"
    //                             sx={{
    //                                 p: "0.5rem 1rem",
    //                                 fontSize: "1rem",
    //                                 fontWeight: 600,
    //                             }}
    //                         >
    //                             {isSubmitting ? (
    //                                 <CircularProgress
    //                                     size={18}
    //                                     color="secondary"
    //                                 />
    //                             ) : (
    //                                 <Typography variant="body1">
    //                                     Next
    //                                 </Typography>
    //                             )}
    //                         </Button>
    //                     </Box>
    //                 </Box>
    //             );
    //         }}
    //     </Formik>
    // );
};

export default StepOne;
