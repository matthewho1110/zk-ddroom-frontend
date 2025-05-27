import AddIcon from "@mui/icons-material/Add";
import { FC, memo } from "react";
import SmartDialogButton from "../../components/SmartDialog/SmartDialogButton";
import CreateDataroomForm from "./CreateDataroomForm";

type CreateDataroomButtonProps = {};

const CreateDataroomButton: FC<CreateDataroomButtonProps> = () => {
    return (
        <>
            <SmartDialogButton
                variant="contained"
                startIcon={<AddIcon />}
                render={CreateDataroomForm}
            >
                Add
            </SmartDialogButton>
        </>
    );
};

export default memo(CreateDataroomButton);
