// import HistoryPage from "../../../../components/dataroom/history/HistoryPage";
import ActivityHistoryPage from "../../../../components/dataroom/history/ActivityHistoryPage";
import { useRouter } from "next/router";
export default function Home() {
    const router = useRouter();
    const { did } = router.query;

    // return <HistoryPage dataroomId={did} />;
    return <ActivityHistoryPage dataroomId={did} />;
}
