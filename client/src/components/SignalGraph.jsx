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
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const SignalGraph = ({ history }) => {
  if (!history || history.length === 0) return null;

  const data = {
    labels: history.map((h) => h.time),
    datasets: [
      {
        label: "Vehicles",
        data: history.map((h) => h.vehicles),
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  return <Line data={data} />;
};

export default SignalGraph;
