import { useRouter } from "next/router";
import MemberManager from "../../../../components/dataroom/members/MemberManager";

export default function Home({ onSetTitle }) {
    const router = useRouter();
    const { did } = router.query;
    return <MemberManager dataroomId={did} onSetTitle={onSetTitle} />;
}
