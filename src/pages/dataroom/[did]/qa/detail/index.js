import useUser from "../../../../../hooks/useUser";
import ErrorPage from "../../../../../components/reusableComponents/ErrorPage";
import QuestionPage from "../../../../../components/dataroom/qa/QuestionPage";
import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();
    const { isLoggedIn } = useUser();
    const { did, qid } = router.query;
    return <QuestionPage did={did} qid={qid} />;
}
