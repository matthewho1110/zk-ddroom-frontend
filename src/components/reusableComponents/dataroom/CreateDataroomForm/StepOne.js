// MUI components
import {
    TextField,
    Button,
    Typography,
    MenuItem,
    Box,
    Stack,
} from "@mui/material";

// Hooks
import { useEffect, useState } from "react";

// Custom hooks
import useUser from "../../../../hooks/useUser";
import { ContractPreview } from "../../contract";

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
                label="Contract ID"
                name="id"
                variant="outlined"
                size="small"
                select
                value={selectedContractID}
                onChange={(e) => setSelectedContractID(e.target.value)}
                required
                helperText="Here you only see contracts that are possible for dataroom creation. I.e. Contracts that are active and have not reached their maximum dataroom limit."
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
                    <Typography variant="body1">Next</Typography>
                </Button>
            </Box>
        </Stack>
    );
};

export default StepOne;
