import useUser from "./useUser";
import useSWR from "swr";

const useDataroomAPI = (dataroomId) => {
    const { axiosInstance } = useUser();
    const fetcher = (url) => axiosInstance.get(url).then((res) => res);
    const getMembers = () => {
        const { data, ...props } = useSWR(
            dataroomId ? `/datarooms/${dataroomId}/members` : null,
            fetcher
        );
        return { data: data?.data || [], ...props };
    };

    const getTags = () => {
        const { data, ...props } = useSWR(
            dataroomId ? `/datarooms/${dataroomId}/tags` : null,
            fetcher
        );
        return { data: data?.data || [], ...props };
    };

    return {
        getMembers,
        getTags,
    };
};

export default useDataroomAPI;
