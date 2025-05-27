import UserPage from "../../components/UserPage";
import { useRouter } from "next/router";

export default function View() {
    const router = useRouter();
    const { uid } = router.query;
    return <UserPage userId={uid} />;
}
