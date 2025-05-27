import FAQ from "../../../../components/dataroom/faq/Faq";
import ErrorPage from "../../../../components/reusableComponents/ErrorPage";
import useUser from "../../../../hooks/useUser";
export default function Home() {
    const { isLoggedIn } = useUser();
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
        return <FAQ />;
    }
}
