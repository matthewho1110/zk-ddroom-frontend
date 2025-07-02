import MeetingPage from "../../../../components/dataroom/meeting/MeetingPage";
import { useRouter } from "next/router";
export default function Home() {
    const router = useRouter();
    const { did } = router.query;

    // return <HistoryPage dataroomId={did} />;
    return <MeetingPage dataroomId={did} />;
}
