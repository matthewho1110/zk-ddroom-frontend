import { formatFileSize } from "../../../utils/fileHelper";

import { Box, LinearProgress, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
}));
const StorageCard = ({ usedStorage, maxStorage, sx }) => {
    const usedStoragePercentage = usedStorage / maxStorage;
    return (
        <Box
            sx={{
                background: "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(4px)",
                webkitBackdropFilter: "blur(4px)",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                margin: 2,
                padding: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                color: "white",
                ...sx,
            }}
        >
            <Typography variant="h6" mb={1}>
                Used Storage:
            </Typography>
            <Typography>
                {formatFileSize(usedStorage) +
                    " / " +
                    (maxStorage == -1
                        ? "Unlimited"
                        : formatFileSize(maxStorage))}
            </Typography>
            <BorderLinearProgress
                variant="determinate"
                color={
                    maxStorage == -1
                        ? "primary"
                        : usedStoragePercentage > 0.9
                        ? "error"
                        : usedStoragePercentage > 0.7
                        ? "warning"
                        : "primary"
                }
                value={maxStorage == -1 ? 0 : usedStoragePercentage * 100}
                sx={{
                    width: "100%",
                    height: 10,
                }}
            />
        </Box>
    );
};

export default StorageCard;
