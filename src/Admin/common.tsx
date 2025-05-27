import {
    ColDef,
    ICellRendererParams,
    PaginationChangedEvent,
} from "ag-grid-community";
import * as yup from "yup";

export const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 90,
    resizable: true,
    cellRenderer: ({ value }: ICellRendererParams) => (
        <> {typeof value === "object" ? JSON.stringify(value) : value}</>
    ),
};

export const defaultPaginationPageSize = 10;

export const paginationSchema = yup.object().shape({
    pageSize: yup.number().required().min(1).max(100),
});

export type PaginationSchema = yup.InferType<typeof paginationSchema>;

export type PaginationPayload = {
    limit: number;
    page: number;
};

export type AdminResultResponse<TData> = {
    results: TData[];
    totalCount: number;
};

export function onPaginationChanged(handleSetPage: (page: number) => void) {
    return (params: PaginationChangedEvent) => {
        handleSetPage(params.api.paginationGetCurrentPage());
    };
}
