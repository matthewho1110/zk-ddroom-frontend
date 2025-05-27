import { yupResolver } from "@hookform/resolvers/yup";
import {
    ColDef,
    GridReadyEvent,
    PaginationChangedEvent,
} from "ag-grid-community";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { FC, memo, useCallback, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DDRoomTextField from "../../components/DDRoomForm/DDRoomTextField";
import useActivityHistories, {
    IAdminActivityHistory,
    activityHistoryQueryKey,
} from "../../hooks/useActivityHistories";
import UtilNavBar from "../UtilNavBar";
import {
    PaginationSchema,
    defaultColDef,
    defaultPaginationPageSize,
    onPaginationChanged,
    paginationSchema,
} from "../common";
import { getServerSideDataSource } from "../getServerSideDataSource";

type ActivityHistoryProps = {};

export type RefetchType = ReturnType<typeof useActivityHistories>["refetch"];

const AdminActivityHistory: FC<ActivityHistoryProps> = () => {
    const [pageSize, setPageSize] = useState(defaultPaginationPageSize);
    const [page, setPage] = useState(0);
    const columnDefs = useMemo<ColDef<IAdminActivityHistory>[]>(
        () => [
            { field: "_id" },
            { field: "eventType" },
            { field: "fileId" },
            { field: "userId" },
            { field: "dataroomId" },
            { field: "userGroupId" },
            { field: "relatedUsers" },
            { field: "relatedGroups" },
            { field: "timestamp" },
            { field: "endTime" },
            { field: "__v" },
        ],
        []
    );
    // * data-fetching
    const { refetch } = useActivityHistories({
        limit: pageSize,
        page,
    });

    // * query input
    const formProps = useForm<PaginationSchema>({
        mode: "all",
        resolver: yupResolver(paginationSchema),
        defaultValues: { pageSize: defaultPaginationPageSize },
    });
    const { control } = formProps;

    // * grid setup
    const onGridReady = useCallback((params: GridReadyEvent) => {
        params.api.setServerSideDatasource(
            getServerSideDataSource(refetch, activityHistoryQueryKey)
        );
    }, []);

    return (
        <FormProvider {...formProps}>
            {/* Navbar */}
            <UtilNavBar<PaginationSchema>
                onSubmit={({ pageSize }) => {
                    setPageSize(pageSize);
                }}
            >
                <DDRoomTextField
                    control={control}
                    required
                    name="pageSize"
                    label="Page Size"
                />
            </UtilNavBar>

            {/* Datagrid */}
            <div
                className="ag-theme-material"
                style={{ height: "100%", width: "100%" }}
            >
                <AgGridReact<IAdminActivityHistory>
                    context={{ pageSize }}
                    columnDefs={columnDefs}
                    paginationPageSize={pageSize}
                    pagination
                    defaultColDef={defaultColDef}
                    rowModelType="serverSide"
                    cacheBlockSize={pageSize}
                    animateRows
                    onGridReady={onGridReady}
                    onPaginationChanged={onPaginationChanged(setPage)}
                />
            </div>
        </FormProvider>
    );
};

export default memo(AdminActivityHistory);
