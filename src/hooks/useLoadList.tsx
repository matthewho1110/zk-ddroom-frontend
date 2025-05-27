import React, {
    useEffect,
    useRef,
    useImperativeHandle,
    forwardRef,
} from "react";
import { throttle } from "../utils/eventHelper";

interface useLoadListProps {
    onReach: (type?: number | string) => Promise<any>; 
    distance?: number; 
    buffer?: number; 
    autoLoad?: boolean;
    scrollEle?: string; 
    isCheckView?: boolean;
    loadStatus: number;
    emptyTxt?: string;
    list: Array<any>;
    morePage: boolean;
}

interface statusProps {
    loadStatus: number;
    morePage: boolean;
    list: Array<any>;
    onReach: (args: any) => {};
}

const Status: React.FC<statusProps> = (props) => {
    const { loadStatus, morePage, list, onReach } = props;

    if (!morePage) {
        return list.length ? <>"no more"</> : <div>empty</div>;
    }
    if (loadStatus === -1) {
        return <div onClick={() => onReach("refresh")}>faild</div>;
    }
    return <>loading</>;
};

const useLoadList: React.ForwardRefRenderFunction<{}, useLoadListProps> = (
    props,
    ref
) => {
    const {
        distance = 100,
        buffer = 5,
        autoLoad = true,
        scrollEle,
        isCheckView,
        onReach,
        loadStatus,
        list,
        morePage,
        emptyTxt,
    } = props;
    let currentPosition = useRef(0);
    let prevPosition = useRef(0);
    let clientH = useRef(0);
    let scrollEleDom = useRef<HTMLDivElement | any>(null);
    let pointRef = useRef<HTMLDivElement | any>(null);
    let active = useRef(false);

    useEffect(() => {
        let handleEvent = throttle(onScrollHandle, 300);
        scrollEleDom.current = scrollEle
            ? document.querySelector(`#${scrollEle}`)
            : window;
        clientH.current =
            scrollEleDom.current === window
                ? window.innerHeight
                : scrollEleDom.current.offsetHeight;
        checkInView();
        scrollEleDom.current.addEventListener("scroll", handleEvent);
        scrollEleDom.current.addEventListener("resize", handleEvent);
        return () => {
            scrollEleDom.current.removeEventListener("scroll", handleEvent);
            scrollEleDom.current.removeEventListener("resize", handleEvent);
        };
    }, []);

    useEffect(() => {
        if (isCheckView) {
            checkInView();
        }
    }, [isCheckView]);

    const onScrollHandle = () => {
        const pageYOffset =
            scrollEleDom.current === window
                ? window.scrollY
                : scrollEleDom.current.scrollTop;
        // 本地缓存
        currentPosition.current = pointRef.current.offsetTop; 
        const isBottom =
            clientH.current + pageYOffset + distance >=
            currentPosition.current - buffer;
        if (isBottom) {
            if (!active.current) {
                prevPosition.current = currentPosition.current;
                active.current = true;
                onReach()
                    .then(() => checkInView())
                    .catch(() => {
                        active.current = false;
                    });
            }
            return;
        }
    };

    const checkInView = (): any => {
        currentPosition.current = pointRef.current.offsetTop;
        if (prevPosition.current <= currentPosition.current && active.current) {
            active.current = false;
        }
        if (
            currentPosition.current < clientH.current &&
            autoLoad &&
            !active.current
        ) {
            return onReach()
                .then(() => checkInView())
                .catch(() => {
                    active.current = false;
                });
        }
    };

    useImperativeHandle(ref, () => ({
        checkInView: () => checkInView(),
    }));

    return (
        <div ref={pointRef} style={{ width: "100%" }}>
            <Status
                loadStatus={loadStatus}
                morePage={morePage}
                list={list}
                onReach={onReach}
            />
        </div>
    );
};

export default forwardRef(useLoadList);
