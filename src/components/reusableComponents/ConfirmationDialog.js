// import mui modules
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slide,
} from "@mui/material";

// import internal modules
import PropTypes from "prop-types";
import { forwardRef } from "react";

// import custom hooks
import useConfirmationDialog from "../../hooks/useConfirmationDialog";
import lange from "@i18n";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ConfirmationDialog = () => {
    // hooks
    const { confirmationDialog, setConfirmationDialog } =
        useConfirmationDialog();

    // functions
    const handleClose = () => {
        confirmationDialog.onCancel();
        setConfirmationDialog(null);
    };

    const handleConfirm = () => {
        confirmationDialog.onConfirm();
        setConfirmationDialog(null);
    };

    if (
        confirmationDialog &&
        confirmationDialog.title &&
        confirmationDialog.description &&
        confirmationDialog.onConfirm
    ) {
        return (
            <Dialog
                open={true}
                TransitionComponent={Transition}
                keepMounted
                sx={{ userSelect: "text" }}
                PaperProps={{
                    sx: {
                        width: "50%",
                    },
                }}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle sx={{ typography: "h5", pb: 3 }}>
                    {confirmationDialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText
                        sx={{ typography: "h6", pb: 1 }}
                        id="alert-dialog-slide-description"
                    >
                        {confirmationDialog.description}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {confirmationDialog.onCancel && (
                        <Button
                            variant="contained"
                            color="neutral"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirm}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        );
    } else {
        return null;
    }
};

export default ConfirmationDialog;
