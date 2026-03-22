import { Header } from "../components/Header";
import { MetricsRow } from "../components/MetricCard";
import { ChampionCard } from "../components/ChampionCard";
import { CompletionChart } from "../components/Charts/CompletionChart";
import { getChampions } from "../utils/champion";
import { EngagementChart } from "../components/Charts/EngagementChart";
import { ScoreChart } from "../components/Charts/ScoreChart";

export default function Dashboard() {
    const students = [
        {
            name: "Dr. K.",
            email: "suganthi@...",
            attempts: 18,
            completed: 17,
            timeTaken: 120,
        },
        {
            name: "Dr. Divya",
            email: "divya@...",
            attempts: 18,
            completed: 17,
            timeTaken: 130,
        },
        {
            name: "Karthikeyan",
            email: "karthi@...",
            attempts: 18,
            completed: 17,
            timeTaken: 140,
        },
    ];

    const totalQuizzes = 17;

    const champions = getChampions(students, totalQuizzes);

    return (
        <div style={{ padding: 24 }}>
            <Header />
            <MetricsRow />

            <div style={{ marginTop: 30 }}>
                <h2>🏆 Section Champions - Completion & Efficiency Masters</h2>

                {champions.map((c) => (
                    <ChampionCard key={c.rank} {...c} />
                ))}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 20,
                    marginTop: 30,
                }}
            >
                <div className="card">
                    <h3>Completion Trend</h3>
                    <CompletionChart />
                </div>

                <div className="card">
                    <h3>Engagement Trend</h3>
                    <EngagementChart />
                </div>

                <div className="card">
                    <h3>Score Distribution</h3>
                    <ScoreChart />
                </div>
            </div>
        </div>
    );
}