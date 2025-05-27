import { createContext, useState } from "react";
import useUser from "../hooks/useUser";

const initialState = {
    text: "",
    type: "",
};

const AlertContext = createContext({
    ...initialState,
    setAlert: () => {},
    alertHandler: () => {},
});

export const AlertProvider = ({ children }) => {
    // Contexts
    const { logout } = useUser();

    // State
    const [text, setText] = useState("");
    const [type, setType] = useState("");

    // Alert Types
    const ALERTS = {
        400: {
            text: "Bad Request. Please check your inputs and try again.",
            type: "warning",
        },
        401: {
            text: "Concurrent or Expired Login. Please login again.",
            type: "warning",
        },
        403: {
            text: "Request Forbidden by Server. Please check if you have the correct permissions to perform this action.",
            type: "warning",
        },
        404: {
            text: "Resource Not Found. Please check your inputs and try again.",
            type: "warning",
        },
        405: {
            text: "Method Not Allowed. Please check your inputs and try again.",
            type: "warning",
        },
        409: {
            text: "Conflict Encountered. Please check your inputs and try again.",
            type: "warning",
        },
        500: {
            text: "Unknown System Error. Please try again later.",
            type: "error",
        },
        default: {
            text: "Unknown System Error. Please try again later.",
            type: "error",
        },
    };

    const setAlert = (text, type) => {
        setText(text);
        setType(type);
    };

    const alertHandler = (err, overriddenAlerts) => {
        let _alert;
        if (err?.response?.status) {
            _alert = ALERTS[err.response.status] || ALERTS["default"];
            if (overriddenAlerts && err.response.status in overriddenAlerts) {
                _alert = {
                    ..._alert,
                    ...overriddenAlerts[err.response.status],
                };
            }
        } else {
            _alert = ALERTS["default"];
        }
        setAlert(_alert.text, _alert.type);
    };

    return (
        <AlertContext.Provider
            value={{
                text,
                type,
                setAlert,
                alertHandler,
            }}
        >
            {children}
        </AlertContext.Provider>
    );
};

export default AlertContext;
