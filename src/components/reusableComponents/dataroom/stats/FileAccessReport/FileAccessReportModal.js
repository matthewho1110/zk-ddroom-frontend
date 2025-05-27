import { Modal, Box, Typography } from "@mui/material";

import lange from "@i18n";
import FileAccessReport from "./index";

const FileAccessReportModal = ({ dataroomId, open, onClose, user }) => {
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
                    {user?.email + "'s "}
                    {lange("Access_Report")}
                </Typography>
                <FileAccessReport dataroomId={dataroomId} user={user} />
            </Box>
        </Modal>
    );
};

export default FileAccessReportModal;
