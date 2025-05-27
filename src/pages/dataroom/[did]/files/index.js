import { useRouter } from "next/router";
import Browser from "@components/dataroom/fileBrowser/Browser";
import useUser from "@hooks/useUser";

export default function Home(props) {
    const router = useRouter();
    const { did, filePath } = router.query;
    return <Browser dataroomId={did} filePath={filePath} {...props} />;
}
