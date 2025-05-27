import { useRouter } from "next/router";
import { useEffect } from "react";
import LoginPage from "../../components/login";
import useUser from "../../hooks/useUser";

export default function Home() {
    const router = useRouter();
    const { isLoggedIn } = useUser();
    const { redirectUrl } = router.query;

    if (isLoggedIn) {
        router.push(redirectUrl || "/datarooms");
        return <></>;
    }

    return <LoginPage />;
}
