// useAlert.js
import { useContext } from "react";
import ConfirmationDialogContext from "../contexts/ConfirmationDialogContext";

// Check out ConfirmationDialogContext.js to see how this hook is used
const useConfirmationDialog = () => useContext(ConfirmationDialogContext);

export default useConfirmationDialog;
