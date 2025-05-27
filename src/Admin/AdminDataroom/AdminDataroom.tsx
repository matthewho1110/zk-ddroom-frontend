import { yupResolver } from "@hookform/resolvers/yup";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { FC, memo, useCallback, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DDRoomTextField from "../../components/DDRoomForm/DDRoomTextField";
import useAdminDatarooms, {
    IAdminDataroom,
    adminDataroomQueryKey,
} from "../../hooks/useAdminDatarooms";
import UtilNavBar from "../UtilNavBar";
import {
    PaginationSchema,
    defaultColDef,
    defaultPaginationPageSize,
    onPaginationChanged,
    paginationSchema,
} from "../common";
import { getServerSideDataSource } from "../getServerSideDataSource";
import CreateDataroomButton from "./CreateDataroomButton";

type AdminDataroomProps = {};

const AdminDataroom: FC<AdminDataroomProps> = () => {
    const columnDefs = useMemo<ColDef<IAdminDataroom>[]>(
        () => [
            { field: "watermark" },
            { field: "_id" },
            { field: "name" },
            { field: "description" },
            { field: "phase" },
            { field: "owner" },
            { field: "organization" },
            { field: "maxStorageSize" },
            { field: "createdAt" },
            { field: "__v" },
            { field: "creationDate" },
            { field: "status" },
            { field: "lastUpdate" },
        ],
        []
    );
    const [pageSize, setPageSize] = useState(defaultPaginationPageSize);
    const [page, setPage] = useState(0);

    // * data-fetching
    const { refetch } = useAdminDatarooms({
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
            getServerSideDataSource(refetch, adminDataroomQueryKey)
        );
    }, []);

    return (
        <>
            <FormProvider {...formProps}>
                {/* Navbar */}
                <UtilNavBar<PaginationSchema>
                    onSubmit={({ pageSize }) => {
                        setPageSize(pageSize);
                    }}
                >
                    <CreateDataroomButton />
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
                    <AgGridReact<IAdminDataroom>
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
        </>
    );
};

export default memo(AdminDataroom);
