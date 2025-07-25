import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login page
        router.push("/login");
    }, []);

    return null;
}
