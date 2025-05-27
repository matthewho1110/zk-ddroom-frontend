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
    Stack,
} from "@mui/material";

import { Form, Formik } from "formik";
import * as Yup from "yup";

// Hooks
import { useEffect, useState } from "react";

// Custom hooks
import useUser from "../../../../hooks/useUser";
import { ContractPreview } from "../../../reusableComponents/contract";
import lange from "@i18n";

const StepOne = ({ active, onNextStep }) => {
    // States
    const [contracts, setContracts] = useState([]);
    const [selectedContractID, setSelectedContractID] = useState(null);

    // Custom hooks
    const { axiosInstance } = useUser();

    const selectedContract = contracts.find(
        (contract) => contract.id === selectedContractID
    );

    const handleSubmit = async (values) => {
        onNextStep(selectedContract);
    };

    const fetchContracts = async () => {
        try {
            const contracts = (
                await axiosInstance.get(
                    "/contracts?status=Active&&canCreateDatarooms=true"
                )
            ).data;

            setContracts(contracts);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    if (active === false) return null;

    return (
        <Stack
            mt={3}
            direction="column"
            spacing={2}
            component="form"
            onSubmit={handleSubmit}
        >
            <TextField
                fullWidth
                label={lange("Contract", "ID")}
                name="id"
                variant="outlined"
                size="small"
                select
                value={selectedContractID}
                onChange={(e) => setSelectedContractID(e.target.value)}
                required
                helperText={lange("Contract_ID_Tips")}
                // Add scrollbar to dropdown
                SelectProps={{
                    MenuProps: {
                        sx: {
                            maxHeight: "300px",
                        },
                    },
                }}
            >
                {contracts.map((contract) => (
                    <MenuItem key={contract.id} value={contract.id}>
                        {contract.id}
                    </MenuItem>
                ))}
            </TextField>
            {selectedContract && (
                <ContractPreview contract={selectedContract} />
            )}
            <Box display="flex" justifyContent="flex-end">
                <Button
                    variant="contained"
                    type="submit"
                    sx={{
                        p: "0.5rem 1rem",
                        fontSize: "1rem",
                        fontWeight: 600,
                    }}
                >
                    <Typography variant="body1">{lange("Next")}</Typography>
                </Button>
            </Box>
        </Stack>
    );
};

export default StepOne;
