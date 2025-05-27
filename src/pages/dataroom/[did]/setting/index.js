import { useRouter } from "next/router";
import SettingPage from "../../../../components/dataroom/setting";

export default function Home() {
    const router = useRouter();
    const { did } = router.query;

    return <SettingPage dataroomId={did} />;
}
