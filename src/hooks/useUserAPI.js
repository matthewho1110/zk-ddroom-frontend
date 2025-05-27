import useUser from "./useUser";
import useSWR from "swr";

const useUserAPI = () => {
    const { axiosInstance, isLoggedIn } = useUser();
    const fetcher = (url) => axiosInstance.get(url).then((res) => res);

    const getEnabledAuthenticators = () => {
        const { data, ...props } = useSWR(
            isLoggedIn ? `/auth/enabledAuthenticators` : null,
            isLoggedIn ? fetcher : null
        );
        return { data: data?.data, status: data?.status, ...props };
    };

    return {
        getEnabledAuthenticators,
    };
};

export default useUserAPI;
