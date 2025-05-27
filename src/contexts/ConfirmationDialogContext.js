import { createContext, useState } from "react";
import useUser from "../hooks/useUser";

// Confirmatioon Dialog Context Example
// const confirmationDialog = {
//     title: "",
//     description: "",
//     onCancel: () => {},
//     onConfirm: () => {},
// };

// Check out frontend/src/components/reusableComponents/ConfirmationDialog.js for usage

const ConfirmationDialogContext = createContext({
    confirmationDialog: null,
    setConfirmationDialog: () => {},
});

export const ConfirmationDialogProvider = ({ children }) => {
    // State
    const [confirmationDialog, setConfirmationDialog] = useState(null);

    // Return
    return (
        <ConfirmationDialogContext.Provider
            value={{
                confirmationDialog,
                setConfirmationDialog,
            }}
        >
            {children}
        </ConfirmationDialogContext.Provider>
    );
};

export default ConfirmationDialogContext;
