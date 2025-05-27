import { useQuery } from "@tanstack/react-query";
import useUser from "./useUser";
import { AxiosInstance } from "axios";
import { AdminResultResponse, PaginationPayload } from "../Admin/common";

export interface IAdminActivityHistory {
    _id: string;
    eventType: string;
    userId: string;
    dataroomId: string;
    userGroupId: string;
    timestamp: string;
    endTime: string;
    __v: number;
}

export const activityHistoryQueryKey = (
    payload: PaginationPayload
): [string, PaginationPayload] => ["activity-history", payload];

export default function useActivityHistories(payload: PaginationPayload) {
    const { axiosInstance } = useUser();

    // * add query param page=10 of an endpoint , start with /getUsers?page=10

    return useQuery<
        AdminResultResponse<IAdminActivityHistory>,
        unknown,
        AdminResultResponse<IAdminActivityHistory>,
        [string, PaginationPayload]
    >(
        activityHistoryQueryKey(payload),
        async ({ queryKey }) => {
            const [_, { page, limit }] = queryKey;
            return (
                await (axiosInstance as unknown as AxiosInstance)?.get<
                    AdminResultResponse<IAdminActivityHistory>
                >(`/activity-history?page=${page}&limit=${limit}`)
            ).data;
        },
        {
            enabled: false,
            keepPreviousData: true,
        }
    );
}
