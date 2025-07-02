import { useRouter } from "next/router";
import AIDocumentPage from "../../../../../components/AIDocument/AIDocumentPage";
export default function Home() {
    const router = useRouter();
    const { did } = router.query;
    return <AIDocumentPage dataroomId={did} />;
}
