import { useRouter } from "next/router";
import RegistrationPage from "../../components/Registration/RegistrationPage";
import ErrorPage from "../../components/reusableComponents/ErrorPage";
import useUser from "../../hooks/useUser";

export default function Home(props) {
    const { isLoggedIn } = useUser();
    const router = useRouter();
    const { code } = router.query;

    if (isLoggedIn) {
        return (
            <ErrorPage
                message={
                    <>You have to logout first to register a new account</>
                }
            />
        );
    } else {
        return <RegistrationPage registrationCode={code} />;
    }
}
