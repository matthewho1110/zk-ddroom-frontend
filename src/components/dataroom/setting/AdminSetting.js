import useSWR from "swr";
import useUser from "../../../hooks/useUser";
import {
  Box,
  FormControl,
  FormControlLabel,
  Slider,
  TextField,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Switch,
  MenuItem,
  InputAdornment,
  Checkbox,
} from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import useAlert from "../../../hooks/useAlert";
import { PHASES } from "../../../configs/dataroomConfig";
import DataroomForm from "../../reusableComponents/dataroom/DataroomForm";
import useUserProfileQuery from "../../../hooks/useUserProfile";

const MainSetting = ({ dataroomId }) => {
  const { axiosInstance } = useUser();
  const { setAlert } = useAlert();
  const data = useUserProfileQuery();
  const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
  const {
    data: dataroomData,
    isLoading: isDataroomLoading,
    mutate: mutateDataroomData,
  } = useSWR(dataroomId ? `/datarooms/${dataroomId}` : null, fetcher);

  const dataroom = dataroomData?.dataroom;
  const handleWikiToggle = async (event) => {
    const newValue = event.target.checked;

    try {
      //setCheckedAI(event.target.checked);
      await axiosInstance.patch(
        `${process.env.BACKEND_URI}/datarooms/${dataroomId}/changeChatOpen`,
        {
          newChatOpen: event.target.checked,
        }
      );
      mutateDataroomData();
      setAlert(
        `Zk-group Wiki has been ${newValue ? "enabled" : "disabled"}`,
        "success"
      );
    } catch (err) {
      console.error(err);
      setAlert("Failed to update Zk-group Wiki setting", "error");
    }
  };

  const handleSubmit = async (values) => {
    const updatedValues = {
      ...values,
    };
    console.log(updatedValues);
    delete updatedValues.contractId;

    try {
      await axiosInstance.patch(`/datarooms/${dataroomId}`, updatedValues);
      mutateDataroomData();
      setAlert("Dataroom details updated successfully", "success");
    } catch (err) {
      console.log(err);
      setAlert("Failed to update dataroom details", "error");
    }
  };

  if (isDataroomLoading) {
    return (
      <Box
        display="flex"
        height="80vh"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <FormControlLabel
        control={
          <Switch
            checked={dataroom?.chatOpen}
            onChange={handleWikiToggle}
            color="primary"
          />
        }
        label="Enable Zk-group Wiki"
      />
      <Box sx={{ mt: 3 }}>
        <Formik
          initialValues={{
            contractManager: dataroom?.contractManager,
            manager: dataroom?.manager,
            hiddenManager: dataroom?.hiddenManager,
            publisher: dataroom?.publisher,
            reviewer: dataroom?.reviewer,
            previewer: dataroom?.previewer,
          }}
          validationSchema={Yup.object({
            contractManager: Yup.string().required("Required"),
            manager: Yup.string().required("Required"),
            hiddenManager: Yup.string().required("Required"),
            publisher: Yup.string().required("Required"),
            reviewer: Yup.string().required("Required"),
            previewer: Yup.string().required("Required"),
          })}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, handleBlur, errors }) => (
            <Form>
              <Stack spacing={3}>
                <TextField
                  name="contractManager"
                  label="Contract Manager"
                  value={values.contractManager}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.contractManager}
                  helperText={errors.contractManager}
                />
                <TextField
                  name="manager"
                  label="Manager"
                  value={values.manager}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.manager}
                  helperText={errors.manager}
                />
                <TextField
                  name="hiddenManager"
                  label="Hidden Manager"
                  value={values.hiddenManager}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.manager}
                  helperText={errors.manager}
                />
                <TextField
                  name="publisher"
                  label="Publisher"
                  value={values.publisher}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.publisher}
                  helperText={errors.publisher}
                />
                <TextField
                  name="reviewer"
                  label="Reviewer"
                  value={values.reviewer}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.reviewer}
                  helperText={errors.reviewer}
                />
                <TextField
                  name="previewer"
                  label="Previewer"
                  value={values.previewer}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.previewer}
                  helperText={errors.previewer}
                />

                <Button type="submit" variant="contained">
                  Update
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default MainSetting;
