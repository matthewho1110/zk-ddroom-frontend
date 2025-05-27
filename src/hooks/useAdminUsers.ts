import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import useUser from "./useUser";
import { AdminResultResponse, PaginationPayload } from "../Admin/common";

export interface IAdminUser {
    _id: string;
    email: string;
    status: string;
    roles: any[];
    datarooms: string[];
    __v: number;
    registrationCode?: string;
    emailAuthenticator: EmailAuthenticator;
    mobileAuthenticator: MobileAuthenticator;
    smsAuthenticator: EmailAuthenticator;
    type: string;
    firstname?: string;
    lastname?: string;
    password?: string;
    organization?: string;
    phone?: string;
    latestAccessToken?: string;
    twoFactorAuth?: TwoFactorAuth;
    resetPasswordCode?: string;
    title?: string;
}

interface TwoFactorAuth {
    enabled: boolean;
    otp_ascii: string;
    otp_auth_url: string;
    otp_base32: string;
    otp_hex: string;
}

interface MobileAuthenticator {
    enabled: boolean;
    _id: string;
    otp_ascii?: string;
    otp_auth_url?: string;
    otp_base32?: string;
    otp_hex?: string;
}

interface EmailAuthenticator {
    enabled: boolean;
    _id: string;
}

export const adminUserQueryKey = (
    payload: PaginationPayload
): [string, PaginationPayload] => ["admin-user", payload];

export default function useAdminUsers(payload: PaginationPayload) {
    const { axiosInstance } = useUser();

    return useQuery<
        AdminResultResponse<IAdminUser>,
        unknown,
        AdminResultResponse<IAdminUser>,
        [string, PaginationPayload]
    >(adminUserQueryKey(payload), async ({ queryKey }) => {
        const [_, { page, limit }] = queryKey;
        return (
            await (axiosInstance as unknown as AxiosInstance)?.get<
                AdminResultResponse<IAdminUser>
            >(`/user/admin-getAll?page=${page}&limit=${limit}`)
        ).data;
    });
}
