import { Button } from "@mui/material";
import { ReactNode } from "react";
import { FieldValues, useFormContext } from "react-hook-form";

type UtilNavBarProps<TData> = {
    onSubmit: (formData: TData) => void;
    children?: ReactNode;
};

function UtilNavBar<TData extends FieldValues>({
    onSubmit: onSubmit,
    children,
}: UtilNavBarProps<TData>) {
    const { handleSubmit } = useFormContext<TData>();
    const onSave = handleSubmit(onSubmit);

    return (
        <>
            <form style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "1rem" }}>{children}</div>
                <Button variant="contained" onClick={onSave} type="submit">
                    Search
                </Button>
            </form>
        </>
    );
}

export default UtilNavBar;
