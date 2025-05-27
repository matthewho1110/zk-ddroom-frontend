import { useEffect, useState, memo } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import useUser from "../../../../hooks/useUser";
import lange from "@i18n";

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "top",
        },
        title: {
            display: true,
            text: lange("Top_Viewers"),
            font: {
                size: 16,
                weight: 500,
            },
        },
    },
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TopViewersBarChart = ({
    dataroomId,
    includeAdmin,
    startTime,
    endTime,
}) => {
    const { axiosInstance } = useUser();
    const [topViewers, setTopViewers] = useState([]);
    // console.log(
    //     topViewers?.map((viewer) => Math.round(viewer.count / 1000 / 60) || 0)
    // );
    const data = {
        labels: topViewers?.map((viewer) => viewer.fullname),
        datasets: [
            {
                label: lange("View_Time") + " (" + lange("In_Minutes") + ")",
                data: topViewers?.map(
                    (viewer) => Math.round(viewer.count / 1000 / 60) || 0
                ),
                backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
        ],
    };
    const fetchTopViewers = async () => {
        try {
            const response = await axiosInstance.get(
                `datarooms/${dataroomId}/topMembers`,
                {
                    params: {
                        includeAdmin: includeAdmin,
                        eventType: "File_view",
                        limit: 5,
                        startTime: startTime,
                        endTime: endTime,
                    },
                }
            );
            setTopViewers(response.data);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        if (dataroomId) {
            fetchTopViewers();
        }
    }, [dataroomId, includeAdmin, startTime, endTime]);
    return <Bar options={options} data={data} />;
};

export default memo(TopViewersBarChart);
