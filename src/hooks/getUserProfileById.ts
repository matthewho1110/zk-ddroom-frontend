// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import useUser from "./useUser";

interface UserProfileResponse {
    email: string;
    firstname: string;
    lastname: string;
}

export default function getUserProfile(id) {
    const { axiosInstance, isLoggedIn } = useUser();
    return useQuery(
        ["listProfile", id],
        async () => {
            return (
                await axiosInstance?.get<UserProfileResponse>(`user/${id}/profile`)
            ).data;
        },
        {
            enabled: isLoggedIn,
            // This should not be changed until the user changes their profile
            staleTime: 60 * 60 * 1000,
        }
    );
}