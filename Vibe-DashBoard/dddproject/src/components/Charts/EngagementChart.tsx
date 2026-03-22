import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export function EngagementChart() {
  return (
    <Line
      data={{
        labels: ["Q1", "Q2", "Q3", "Q4", "Q5"],
        datasets: [
          {
            data: [10, 25, 40, 60, 80],
            borderColor: "#22c55e",
            tension: 0.4,
          },
        ],
      }}
      options={{
        plugins: { legend: { display: false } },
      }}
    />
  );
}