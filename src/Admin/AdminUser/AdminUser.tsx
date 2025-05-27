import { yupResolver } from "@hookform/resolvers/yup";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { FC, memo, useCallback, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DDRoomTextField from "../../components/DDRoomForm/DDRoomTextField";
import useAdminUsers, {
    IAdminUser,
    adminUserQueryKey,
} from "../../hooks/useAdminUsers";
import UtilNavBar from "../UtilNavBar";
import {
    PaginationSchema,
    defaultColDef,
    defaultPaginationPageSize,
    onPaginationChanged,
    paginationSchema,
} from "../common";
import { getServerSideDataSource } from "../getServerSideDataSource";

type AdminUserProps = {};

const AdminUser: FC<AdminUserProps> = () => {
    const columnDefs = useMemo<ColDef<IAdminUser>[]>(
        () => [
            { field: "_id" },
            { field: "email" },
            { field: "status" },
            { field: "roles" },
            { field: "datarooms" },
            { field: "__v" },
            { field: "registrationCode" },
            { field: "emailAuthenticator" },
            { field: "mobileAuthenticator" },
            { field: "smsAuthenticator" },
            { field: "type" },
            { field: "firstname" },
            { field: "lastname" },
            { field: "password" },
            { field: "organization" },
            { field: "phone" },
            { field: "latestAccessToken" },
            { field: "twoFactorAuth" },
            { field: "resetPasswordCode" },
            { field: "title" },
        ],
        []
    );

    const [pageSize, setPageSize] = useState(defaultPaginationPageSize);
    const [page, setPage] = useState(0);

    // * data-fetching
    const { refetch } = useAdminUsers({
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
            getServerSideDataSource(refetch, adminUserQueryKey)
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
                    <AgGridReact<IAdminUser>
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

export default memo(AdminUser);
