// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import useUser from "./useUser";

interface UserProfileResponse {
    _id: string;
    email: string;
    firstname: string;
    lastname: string;
    organization: string;
    title: string;
    phone: string;
    platform_role: string;
}

export default function useUserProfileQuery() {
    const { axiosInstance, isLoggedIn } = useUser();

    return useQuery(
        ["user/profile"],
        async () => {
            return (
                await axiosInstance?.get<UserProfileResponse>(`user/profile`)
            ).data;
        },
        {
            enabled: isLoggedIn,
            // This should not be changed until the user changes their profile
            staleTime: 60 * 60 * 1000,
        }
    );
}
