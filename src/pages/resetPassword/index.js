import { useRouter } from "next/router";
import ResetPasswordPage from "../../components/resetPassword/ResetPasswordPage";
import ErrorPage from "../../components/reusableComponents/ErrorPage";
import useUser from "../../hooks/useUser";

export default function ResetPassword() {
    const { isLoggedIn } = useUser();
    const router = useRouter();
    const { code } = router.query;

    if (isLoggedIn) {
        return (
            <ErrorPage
                message={<>You cannot reset password when logged in</>}
            />
        );
    } else {
        return <ResetPasswordPage resetPasswordCode={code} />;
    }
}
