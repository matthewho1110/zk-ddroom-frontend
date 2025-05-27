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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TopCollectorsBarChart = ({
    dataroomId,
    includeAdmin,
    startTime,
    endTime,
}) => {
    const { axiosInstance } = useUser();
    const [topCollectors, setTopCollectors] = useState([]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: lange("Top_Collectors"),
                font: {
                    size: 16,
                    weight: 500,
                },
            },
        },
    };

    const data = {
        labels: topCollectors?.map((collector) => collector.fullname),
        datasets: [
            {
                label: lange("Download"),
                data: topCollectors?.map((collector) => collector.count || 0),
                backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
        ],
    };
    const fetchTopCollectors = async () => {
        try {
            const response = await axiosInstance.get(
                `datarooms/${dataroomId}/topMembers`,
                {
                    params: {
                        includeAdmin: includeAdmin,
                        eventType: "File_download",
                        limit: 5,
                        startTime: startTime,
                        endTime: endTime,
                    },
                }
            );

            setTopCollectors(response.data);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        if (dataroomId) {
            fetchTopCollectors();
        }
    }, [dataroomId, includeAdmin, startTime, endTime]);
    return <Bar options={options} data={data} />;
};

export default memo(TopCollectorsBarChart);
