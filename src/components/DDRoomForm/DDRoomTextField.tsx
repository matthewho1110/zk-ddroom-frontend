import { StyledComponent } from "@emotion/styled";
import { TextField, TextFieldProps } from "@mui/material";
import {
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
} from "react-hook-form";
import { formatString } from "./utils";

// * This is the generic React-Hook=Form x MUI TextField x Styled-Component (emotion) wrapper

export type DDRoomTextFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    styledTextField?: StyledComponent<TextFieldProps>;
} & Omit<ControllerProps<TFieldValues, TName>, "render"> &
    TextFieldProps;

// TODO add forwardRef
function DDRoomTextField<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
    styledTextField: StyledTextField,
    ...inputProps
}: DDRoomTextFieldProps<TFieldValues, TName>) {
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            rules={rules}
            shouldUnregister={shouldUnregister}
            render={({
                field: { value, onChange, onBlur, ref },
                fieldState: { error },
            }) => (
                <>
                    {StyledTextField ? (
                        <StyledTextField
                            {...inputProps}
                            error={!!error}
                            ref={ref}
                            onBlur={onBlur}
                            defaultValue={value}
                            value={value || ''}
                            onChange={onChange}
                            helperText={error ? error.message : null}
                            label={
                                inputProps.label
                                    ? inputProps.label
                                    : formatString(name)
                            }
                        />
                    ) : (
                        <TextField
                            {...inputProps}
                            error={!!error}
                            ref={ref}
                            onBlur={onBlur}
                            defaultValue={value}
                            value={value || ''}
                            onChange={onChange}
                            helperText={error ? error.message : null}
                            label={
                                inputProps.label
                                    ? inputProps.label
                                    : formatString(name)
                            }
                        />
                    )}
                </>
            )}
        />
    );
}

export default DDRoomTextField;
