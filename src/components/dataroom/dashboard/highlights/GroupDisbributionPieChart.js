import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import useUser from "../../../../hooks/useUser";
import { useEffect, useState, memo } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const GroupDisbributionPieChart = ({
    dataroomId,
    includeAdmin = true,
    title,
    label,
    field,
    startTime,
    endTime,
}) => {
    const { axiosInstance } = useUser();
    const [groupDistribution, setGroupDistribution] = useState([]);

    const fetchGroupDistribution = async () => {
        try {
            const response = await axiosInstance.get(
                `/datarooms/${dataroomId}/groupDistribution`,
                {
                    params: {
                        field: field,
                        includeAdmin: includeAdmin,
                        startTime: startTime,
                        endTime: endTime,
                    },
                }
            );
            // console.log(response.data.results);
            setGroupDistribution(response.data.results);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (dataroomId && field) {
            fetchGroupDistribution();
        }
    }, [dataroomId, includeAdmin, startTime, endTime, field]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: 500,
                },
            },
        },
    };
    const data = {
        labels:
            groupDistribution?.length > 0
                ? groupDistribution?.map((group) => group.name)
                : ["No group"],
        datasets: [
            {
                label: label,
                data:
                    groupDistribution?.length > 0
                        ? groupDistribution?.map((group) => {
                              if (field == "viewTime") {
                                  return Math.round(group[field] / 60 / 1000);
                              }
                              return group[field];
                          })
                        : [0],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    return <Pie data={data} options={options} />;
};
export default memo(GroupDisbributionPieChart);
