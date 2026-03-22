import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export function CompletionChart() {
  return (
    <Line
      data={{
        labels: ["Q1", "Q2", "Q3", "Q4", "Q5"],
        datasets: [
          {
            data: [40, 55, 60, 75, 90],
            borderColor: "#8b5cf6",
            tension: 0.4,
          },
        ],
      }}
      options={{
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#aaa" } },
          y: { ticks: { color: "#aaa" } },
        },
      }}
    />
  );
}