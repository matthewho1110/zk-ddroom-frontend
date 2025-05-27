import ContractPage from "../../components/ContractPage";
import { useRouter } from "next/router";

export default function View() {
    const router = useRouter();
    const { cid } = router.query;
    return <ContractPage contractId={cid} />;
}
