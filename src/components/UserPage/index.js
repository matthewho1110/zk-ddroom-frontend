import { useEffect, useState } from "react";
import useSWR from "swr";
// MUI components
import {
    Box,
    Button,
    IconButton,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Checkbox,
    InputAdornment,
    CircularProgress,
    Divider,
    Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers-pro";

import ReplyIcon from "@mui/icons-material/Reply";

// Custom hooks
import useUser from "../../hooks/useUser";
import useUserProfileQuery from "../../hooks/useUserProfile";

// Internal hooks
import { useRouter } from "next/router";

// External modules
import { Formik } from "formik";
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
} from "../../utils/inputValidator";
import DataroomsList from "../reusableComponents/dataroom/DataroomsList";
import { ContractPreview } from "../reusableComponents/contract";
import { bytesToGb, gbToBytes } from "../../utils/fileHelper";
import useAlert from "../../hooks/useAlert";
import ContractForm from "../reusableComponents/contract/ContractForm";

const contractSchema = Yup.object().shape({
    id: contractIdYupSchema,
    description: contractDescriptionYupSchema,
    organization: contractOrganizationYupSchema,
    maxStorage: contractMaxStorageYupSchema,
    maxDatarooms: contractMaxDataroomsYupSchema,
    managerEmail: emailYupSchema,
    signAt: dateYupSchema.max(new Date(), "Sign date must be in the past"),
    startAt: dateYupSchema,
    expireAt: dateYupSchema.min(
        Yup.ref("startAt", "Start date"),
        "Expire date must be after start date"
    ),
});

const UserPage = ({ userId }) => {
    // Custom hooks
    const { axiosInstance } = useUser();
    const router = useRouter();
    const data = useUserProfileQuery();

    // const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
    // const {
    //     data: contractData,
    //     isLoading: isContractLoading,
    //     mutate: mutateContractData,
    // } = useSWR(contractId ? `/contracts/${contractId}` : null, fetcher);

    // let contract = contractData;
    // const handleUpdate = async (values) => {
    //     try {
    //         await axiosInstance.patch(`/contracts/${contractId}`, values);
    //         mutateContractData();
    //         setAlert("Contract details updated successfully", "success");
    //     } catch (err) {
    //         console.log(err);
    //         setAlert("Failed to update contract details", "error");
    //     }
    // };
    // if (isContractLoading) {
    //     return (
    //         <Box
    //             display="flex"
    //             height="80vh"
    //             justifyContent="center"
    //             alignItems="center"
    //         >
    //             <CircularProgress />
    //         </Box>
    //     );
    // }
    return (
        <Box display="flex" flexDirection="column" p={5}>
            <Button
                startIcon={<ReplyIcon />}
                sx={{ typography: "h6", mr: "auto", mb: 3 }}
                onClick={() => router.push("/users")}
            >
                Back to user list
            </Button>
            <Typography variant="h4" align="center" sx={{ mb: 5 }}>
                User Details
            </Typography>{" "}
            {/* 
            {canEdit && (
                <ContractForm
                    contract={contract}
                    showCancelButton={true}
                    onSubmit={handleUpdate}
                    submitText="Update"
                />
            )}
            {!canEdit && (
                <ContractPreview contract={contract} typography="h5" />
            )}
            <Divider sx={{ my: 5 }}></Divider> */}
            <Box height="80vh">
                <DataroomsList filters={{ userId: userId }} />
            </Box>
        </Box>
    );
};

export default UserPage;
