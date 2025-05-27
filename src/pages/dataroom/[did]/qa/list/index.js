import MyQuestions from "../../../../../components/dataroom/qa/MyQuestions";
import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();
    const { did } = router.query;

    return <MyQuestions did={did} />;
}
