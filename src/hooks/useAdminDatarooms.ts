import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import useUser from "./useUser";
import { AdminResultResponse, PaginationPayload } from "../Admin/common";

export interface IAdminDataroom {
    watermark: Watermark;
    _id: string;
    name: string;
    description: string;
    phase: string;
    owner: string;
    organization?: string;
    maxStorageSize: number;
    createdAt: string;
    __v: number;
    creationDate?: string;
    status?: string;
    lastUpdate?: string;
}

export interface Watermark {
    textPosition: string[];
    contentOptions: string[];
    text?: string;
    customText?: string;
}

export const adminDataroomQueryKey = (
    payload: PaginationPayload
): [string, PaginationPayload] => ["admin-dataroom", payload];

export default function useAdminDatarooms(payload: PaginationPayload) {
    const { axiosInstance } = useUser();

    return useQuery<
        AdminResultResponse<IAdminDataroom>,
        unknown,
        AdminResultResponse<IAdminDataroom>,
        [string, PaginationPayload]
    >(adminDataroomQueryKey(payload), async ({ queryKey }) => {
        const [_, { page, limit }] = queryKey;
        return (
            await (axiosInstance as unknown as AxiosInstance)?.get<
                AdminResultResponse<IAdminDataroom>
            >(`/datarooms/admin-getAll/?page=${page}&limit=${limit}`)
        ).data;
    });
}
