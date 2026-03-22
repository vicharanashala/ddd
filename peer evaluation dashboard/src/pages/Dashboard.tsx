import Streak from "../components/Dashboard/Streak";
import ProgressChart from "../components/Charts/ProgressChart";
import ACChart from "../components/Charts/XPChart";
import PerformanceMeter from "../components/Charts/PerformanceMeter";
import MiniGames from "../components/Gamification/MiniGames";
import Badges from "../components/Dashboard/Badges";
import Leaderboard from "../components/Leaderboard/Leaderboard";
import "./styles.css";
import StreakCalendar from "../components/Charts/StreakCalender";

const Dashboard = () => {
  return (
    <main className="dashboard">
      <div className="card">
        <ProgressChart />
        <div className="card-title"> Month Progress Chart</div>
      </div>

      <div className="card">
        <ACChart />
        <div className="card-title"> Weekly Accuracy Breakdown</div>
      </div>

      <div className="card">
        <PerformanceMeter />
        <div className="card-title"> Today's Performance Meter</div>
      </div>

      <div className="card">
        <MiniGames />
        <div className="card-title"> Mini Games</div>
      </div>

      <div className="card">
        <Streak />
        <div className="card-title">Streak</div>
      </div>

      <div className="card">
        <Badges />
        <div className="card-title">Achievement Badges</div>
      </div>
      <div>
        <StreakCalendar
          streakData={[
            { date: "2026-03-01", count: 1 },
            { date: "2026-03-02", count: 3 },
            { date: "2026-03-03", count: 0 },
            { date: "2026-03-04", count: 5 },
            { date: "2026-03-05", count: 2 },
            { date: "2026-03-06", count: 4 },
            { date: "2026-03-07", count: 6 },
          ]}
        />

      </div>

      <div className="card leaderboard-full">
        <Leaderboard />
        <div className="card-title">Leaderboard</div>
      </div>
    </main>
  );
};

export default Dashboard;
