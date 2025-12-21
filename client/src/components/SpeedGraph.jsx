import {
    Line
} from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Filler
} from "chart.js";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Filler
);

const SpeedGraph = ({ history }) => {
    if (!history || history.length === 0) return null;

    const data = {
        labels: history.map((h) => h.time),
        datasets: [
            {
                label: "Avg Speed (km/h)",
                data: history.map((h) => h.avgSpeed),
                borderColor: "#8b5cf6", // Purple
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 2
            }
        ]
    };

    const options = {
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return <Line data={data} options={options} />;
};

export default SpeedGraph;
