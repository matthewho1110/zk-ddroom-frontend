import { Grid, Typography } from "@mui/material";

// Custom utils
import { formatFileSize } from "../../../utils/fileHelper";
import lange from "@i18n";

const ContractPreview = ({ contract, typography = "body1" }) => {
    return (
        <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
                <Typography variant={typography}>
                    <strong>{lange("Contract", "ID")} :</strong> {contract?.id}
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant={typography}>
                    <strong>{lange("Contract", "Status")} :</strong> {lange(contract?.status)}
                </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
                <Typography variant={typography}>
                    <strong>{lange("Contract", "Manager")} :</strong> {contract?.managerEmail}
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant={typography}>
                    <strong>{lange("Contract", "Organization")} :</strong>{" "}
                    {contract?.organization}
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant={typography}>
                    <strong>{lange("Max_Storage")}:</strong>{" "}
                    {contract?.maxStorage == -1
                        ? "Unlimited"
                        : formatFileSize(contract?.maxStorage)}
                </Typography>
            </Grid>
            {contract?.allocatedStorage != null && (
                <Grid item xs={12} md={6}>
                    <Typography variant={typography}>
                        <strong>{lange("Allocated_Storage")}:</strong>{" "}
                        {formatFileSize(contract?.allocatedStorage)}
                    </Typography>
                </Grid>
            )}
            <Grid item xs={12} md={6}>
                <Typography variant={typography}>
                    <strong>{lange("Max", "Dataroom")} :</strong>{" "}
                    {contract?.maxDatarooms == -1
                        ? "Unlimited"
                        : contract?.maxDatarooms}
                </Typography>
            </Grid>
            {contract?.createdDatarooms != null && (
                <Grid item xs={12} md={6}>
                    <Typography variant={typography}>
                        <strong>{lange("Created", "Dataroom")}:</strong>{" "}
                        {contract?.createdDatarooms}
                    </Typography>
                </Grid>
            )}

            <Grid item xs={12} md={6}>
                <Typography variant={typography}>
                    <strong>{lange("Sign_Date")}:</strong>{" "}
                    {new Date(contract?.signAt).toDateString()}
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant={typography}>
                    <strong>{lange("Start_Date")}:</strong>{" "}
                    {new Date(contract?.startAt).toDateString()}
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant={typography}>
                    <strong>{lange("Expire_Date")}:</strong>{" "}
                    {new Date(contract?.expireAt).toDateString()}
                </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant={typography}>
                    <strong>{lange("Description")}:</strong> {contract?.description}
                </Typography>
            </Grid>
        </Grid>
    );
};

export default ContractPreview;
