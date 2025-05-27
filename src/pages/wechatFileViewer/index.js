import { useRouter } from "next/router";
import Browser from "@components/dataroom/fileBrowser/Browser";
import useUser from "@hooks/useUser";
import { useEffect, useState } from "react";
import WechatCustomFileViewer from "@components/dataroom/fileBrowser/fileViewer/WechatCustomFileViewer";
import { Paper } from "@mui/material";

export default function Home(props) {
    const router = useRouter();
    const [file, setFile] = useState(null);
    const { did, filePath, token } = router.query;

    const getFile = async () => {
        if (did && filePath && token) {
            const res = await fetch(
                `${process.env.BACKEND_URI}/datarooms/${did}/wechatFiles?path=${filePath}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();
            console.log(data);
            setFile(data);
        }
    };

    useEffect(() => {
        getFile();
    }, [did, filePath, token]);

    if (file) {
        return (
            <WechatCustomFileViewer
                permission={file.permission?.level}
                file={file}
                datatroomId={did}
            />
        );
    } else {
        return <div>loading...</div>;
    }
}
