import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import { FC, memo, useMemo, useRef, useState } from "react";
import { Subject } from "rxjs";

export type UseDialogProps = {
    open: boolean;
    handleOpen: () => void;
    handleClose: () => void;
    submit$: Subject<void>;
    cancel$: Subject<void>;
};
export function useDialog(defaultOpen: boolean = false): UseDialogProps {
    const [open, setOpen] = useState(defaultOpen);
    const { cancel$, submit$ } = useMemo(
        () => ({
            submit$: new Subject<void>(),
            cancel$: new Subject<void>(),
        }),
        []
    );

    // * handleOpen
    const handleOpen = () => {
        setOpen(true);
    };

    // * handleClose
    const handleClose = () => {
        setOpen(false);
    };

    return {
        open,
        handleOpen,
        handleClose,
        cancel$,
        submit$,
    };
}

export type SmartDialogProps = {
    title?: string;
    handleClose: () => void;
    open: boolean;
    children?: React.ReactNode;
    submitText?: string;
    cancelText?: string;
} & UseDialogProps;

const SmartDialog: FC<SmartDialogProps> = ({
    title = "(Title)",
    handleClose,
    open,
    children,
    cancelText = "Cancel",
    submitText = "Confirm",
    cancel$,
    submit$,
}) => {
    return (
        <>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    <Typography variant="h3">{title}</Typography>
                </DialogTitle>
                <DialogContent
                    style={{
                        display: "flex",
                        gap: "1rem",
                        flexDirection: "column",
                        width: 600,
                        padding: "2rem",
                    }}
                >
                    {children}
                </DialogContent>
                <DialogActions>
                    <Button
                        color="error"
                        onClick={() => {
                            handleClose();
                            cancel$.next();
                        }}
                    >
                        {cancelText}
                    </Button>
                    <Button color="primary" onClick={() => submit$.next()}>
                        {submitText}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default memo(SmartDialog);
