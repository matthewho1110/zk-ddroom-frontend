import Dashboard from "../../../../components/dataroom/dashboard";
import ErrorPage from "../../../../components/reusableComponents/ErrorPage";
import useUser from "../../../../hooks/useUser";
import { useRouter } from "next/router";

export default function Home({ onSetTitle }) {
    const { isLoggedIn } = useUser();
    const router = useRouter();

    const { did } = router.query;
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
        return <Dashboard dataroomId={did} onSetTitle={onSetTitle} />;
    }
}
