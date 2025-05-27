import UserAccessReport from "./index";
import { Modal, Box, Typography } from "@mui/material";

import lange from "@i18n";

const UserAccessReportModal = ({ dataroomId, open, onClose, file }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    marginTop: 5,
                    background: "white",
                    width: "80%",
                    mx: "auto",
                    borderRadius: 2,
                }}
            >
                <Typography sx={{ py: 2 }} variant="h3" textAlign="center">
                    {file?.name + "'s "} {lange("Access_Report")}
                </Typography>
                <UserAccessReport dataroomId={dataroomId} file={file} />
            </Box>
        </Modal>
    );
};

export default UserAccessReportModal;
