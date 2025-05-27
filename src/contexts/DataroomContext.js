import { useRouter } from "next/router";
import useAlert from "../hooks/useAlert";
import useUser from "../hooks/useUser";
import { createContext, useEffect, useState } from "react";

const INITIAL_STATE = {
    dataroomInfo: null,
};

const DataroomContext = createContext({
    ...INITIAL_STATE,
});

export const DataroomProvider = ({ children }) => {
    const router = useRouter();
    const { did } = router.query;
    const [dataroomInfo, setDataroomInfo] = useState(null);
    const { axiosInstance, logout, isLoggedIn } = useUser();
    const { alertHandler } = useAlert();

    useEffect(() => {
        if (did && isLoggedIn) {
            updateDataroomInfo();
        }
    }, [did]);

    const updateDataroomInfo = async () => {
        try {
            const updateddataroomInfo = (
                await axiosInstance.get(
                    `${process.env.BACKEND_URI}/datarooms/${did}`
                )
            ).data;
            setDataroomInfo(updateddataroomInfo);
        } catch (err) {
            console.log(err);
            alertHandler(err);
        }
    };

    return (
        <DataroomContext.Provider
            value={{
                dataroomInfo,
                updateDataroomInfo,
            }}
        >
            {children}
        </DataroomContext.Provider>
    );
};

export default DataroomContext;
