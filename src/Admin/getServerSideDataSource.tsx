import {
    QueryObserverResult,
    RefetchOptions,
    RefetchQueryFilters,
} from "@tanstack/react-query";
import { IServerSideDatasource } from "ag-grid-community";
import { PaginationPayload } from "./common";

export function getServerSideDataSource(
    refetch: <TPageData>(
        options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
    ) => Promise<
        QueryObserverResult<{ results: any[]; totalCount: number }, unknown>
    >,
    queryKeyFn: (payload: PaginationPayload) => [string, PaginationPayload]
): IServerSideDatasource {
    return {
        getRows: async (params) => {
            console.debug(
                "[Datasource] - rows requested by grid: ",
                params.request
            );

            const { data, isError, isSuccess } = await refetch({
                queryKey: queryKeyFn({
                    page: params.context.page,
                    limit: params.context.pageSize,
                }),
            });

            if (isSuccess) {
                params.success({
                    rowData: data?.results,
                    rowCount: data.totalCount,
                });
                return;
            }

            if (isError) {
                params.fail();
                return;
            }
        },
    };
}
