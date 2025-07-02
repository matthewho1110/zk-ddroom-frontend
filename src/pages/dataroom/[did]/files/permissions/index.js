import { useRouter } from "next/router";
import PermissionsPage from "../../../../../components/dataroom/permissions/PermissionsPage";
export default function Home() {
    const router = useRouter();
    const { did } = router.query;
    return <PermissionsPage dataroomId={did} />;
}
