import { Button, ButtonProps } from "@mui/material";
import { FC, memo } from "react";
import SmartDialog, { UseDialogProps, useDialog } from "./SmartDialog";

type SmartDialogButtonProps = {
    render?: FC<UseDialogProps>;
    defaultOpen?: boolean;
} & ButtonProps;

const SmartDialogButton: FC<SmartDialogButtonProps> = ({
    render: DialogContent,
    defaultOpen,
    ...props
}) => {
    const dialogProps = useDialog(defaultOpen);
    return (
        <>
            <SmartDialog title="Create new dataroom" {...dialogProps}>
                {DialogContent && <DialogContent {...dialogProps} />}
            </SmartDialog>

            <Button {...props} onClick={() => dialogProps.handleOpen()} />
        </>
    );
};

export default memo(SmartDialogButton);
