import { FC, memo, useEffect } from "react";
import * as yup from "yup";
import DDRoomTextField from "../../components/DDRoomForm/DDRoomTextField";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormGroup, Typography } from "@mui/material";
import { SmartDialogProps } from "../../components/SmartDialog/SmartDialog";

import lange from "@i18n";

//  * refer IAdminDataroom
const createDataroomSchema = yup.object().shape({
    name: yup.string().required(),
    description: yup.string().required(),
    phase: yup.string().required(),
    owner: yup.string().required(),
    organization: yup.string().required(),
    maxStorageSize: yup.number().required(),
    status: yup.string().required(),
    // * add watermark, refer Watermark interface
    watermark: yup.object().shape({
        textPosition: yup.string(),
        contentOptions: yup.string(),
        text: yup.string().optional(),
        customText: yup.string().optional(),
    }),
});

// * infer createDataroomSchema type
export type CreateDataroomSchema = yup.InferType<typeof createDataroomSchema>;

type CreateDataroomFormProps = {} & SmartDialogProps;

const CreateDataroomForm: FC<CreateDataroomFormProps> = ({ submit$ }) => {
    const { control, handleSubmit } = useForm<CreateDataroomSchema>({
        resolver: yupResolver(createDataroomSchema),
        defaultValues: {},
    });

    const onSubmit = handleSubmit(
        (formData) => {
            // * on success
            alert(JSON.stringify(formData));
        },
        (err) => {
            // * on error
            console.debug("err form submission", err);
        }
    );

    useEffect(() => {
        const sub = submit$.subscribe(() => onSubmit());
        return () => sub.unsubscribe();
    }, [submit$]);

    return (
        <>
            <DDRoomTextField control={control} name="name" />
            <DDRoomTextField control={control} name="description" />
            <DDRoomTextField control={control} name="phase" />
            <DDRoomTextField control={control} name="owner" />
            <DDRoomTextField control={control} name="organization" />
            <DDRoomTextField control={control} name="maxStorageSize" />
            <DDRoomTextField control={control} name="status" />

            <Typography variant="h6">Watermark</Typography>

            <DDRoomTextField
                control={control}
                name="watermark.textPosition"
                label="Text Position (please put it in the format of 'x,y')"
            />
            <DDRoomTextField
                control={control}
                name="watermark.contentOptions"
                label="Content Options (please put it in the format of 'x,y')"
            />
            <DDRoomTextField
                control={control}
                name="watermark.text"
                label={lange("Text")}
            />
            <DDRoomTextField
                control={control}
                name="watermark.customText"
                label={lange("Custom_Text")}
            />
        </>
    );
};

export default memo(CreateDataroomForm);
