import {
    Bar
} from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

const EnvironmentGraph = ({ history }) => {
    if (!history || history.length === 0) return null;

    const data = {
        labels: history.map((h) => h.time),
        datasets: [
            {
                label: "Air Quality Index (AQI)",
                data: history.map((h) => h.aqi),
                backgroundColor: history.map(h => {
                    if (h.aqi > 200) return "#ef4444"; // high pollution (red)
                    if (h.aqi > 100) return "#f59e0b"; // moderate (yellow)
                    return "#10b981"; // good (green)
                }),
                borderRadius: 4,
            }
        ]
    };

    const options = {
        responsiveness: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return <Bar data={data} options={options} />;
};

export default EnvironmentGraph;
