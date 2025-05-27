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
    MenuItem,
    InputAdornment,
    Checkbox,
} from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
    dataroomNameYupSchema,
    dataroomDescriptionYupSchema,
    dataroomOrganizationYupSchema,
    dataroomPhaseYupSchema,
    dataroomStorageYupSchema,
} from "../../../utils/inputValidator";

import {
    bytesToGb,
    formatFileSize,
    gbToBytes,
} from "../../../utils/fileHelper";
import { useEffect, useState } from "react";
import useAlert from "../../../hooks/useAlert";
import { PHASES } from "../../../configs/dataroomConfig";
import DataroomForm from "../../reusableComponents/dataroom/DataroomForm";

const MainSetting = ({ dataroomId }) => {
    const { axiosInstance } = useUser();
    const { setAlert } = useAlert();

    const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    const {
        data: dataroomData,
        isLoading: isDataroomLoading,
        mutate: mutateDataroomData,
    } = useSWR(dataroomId ? `/datarooms/${dataroomId}` : null, fetcher);

    const dataroom = dataroomData?.dataroom;
    const contract = dataroomData?.contract;

    const handleSubmit = async (values) => {
        const updatedValues = {
            ...values,
        };
        delete updatedValues.contractId;

        try {
            await axiosInstance.patch(
                `/datarooms/${dataroomId}`,
                updatedValues
            );
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
            <DataroomForm
                contract={contract}
                dataroom={dataroom}
                onSubmit={handleSubmit}
                showCancelButton={true}
                submitText="Update"
            />
        </Box>
    );
};

export default MainSetting;
