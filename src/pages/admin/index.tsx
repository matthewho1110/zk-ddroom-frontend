// * this is a Admin nextjs typescript page

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import { NextPage } from "next";
import AdminPage from "../../Admin/AdminPage";
import ErrorPage from "../../components/reusableComponents/ErrorPage";
import useUser from "../../hooks/useUser";

const Admin: NextPage = () => {
    const { isLoggedIn } = useUser();

    /* @ts-ignore */
    if (!isLoggedIn) {
        return (
            <ErrorPage
                message={
                    <>
                        You have to <a href="/login">login</a> first to enter
                        this page
                    </>
                }
            />
        );
    } else {
        return <AdminPage />;
    }
};

export default Admin;
