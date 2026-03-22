import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,   // ✅ REQUIRED
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,   // ✅ ADD THIS
  Title,
  Tooltip,
  Legend
);

export function ScoreChart() {
  return (
    <Bar 
      key="score-chart"
      data={{
        labels: ["Q1", "Q2", "Q3", "Q4", "Q5"],
        datasets: [
          {
            data: [85, 90, 92, 96, 99],
            backgroundColor: "#6366f1",
          },
        ],
      }}
      options={{
        plugins: { legend: { display: false } },
      }}
    />
  );
}