import React, { useState } from 'react';
import { Zap, Trophy, Calendar, Clock, BookOpen, Target, PieChart, Flame } from 'lucide-react';
import ProgressChart from '../components/dashboard/ProgressChart';
import StreakCard from '../components/dashboard/StreakCard';
import LeaderboardCard from '../components/dashboard/LeaderboardCard';
import AchievementCard from '../components/dashboard/AchievementCard';
import DailyGoalCard from '../components/dashboard/DailyGoalCard';
import CoursesProgressCard from '../components/dashboard/CoursesProgressCard';
import StatsCard from '../components/ui/StatsCard';
import { useProgress } from '../context/ProgressContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { getChartData, getWeeklyActivity, getRecentAchievements, userCourses } = useProgress();
  const { user } = useUser();
  const { darkMode } = useTheme();
  const [chartPeriod, setChartPeriod] = useState('month');
  
  // Motivational quotes
  const motivationalQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream bigger. Do bigger.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little progress is still progress.",
    "Great things never come from comfort zones.",
    "Don't wait for opportunity. Create it.",
    "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
    "The key to success is to focus on goals, not obstacles."
  ];

  const [currentQuote] = useState(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('quoteDate');
    const savedQuoteIndex = localStorage.getItem('quoteIndex');
    
    if (savedDate === today && savedQuoteIndex) {
      return motivationalQuotes[parseInt(savedQuoteIndex)];
    } else {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      localStorage.setItem('quoteDate', today);
      localStorage.setItem('quoteIndex', randomIndex.toString());
      return motivationalQuotes[randomIndex];
    }
  });
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  // Calculate completion rate compared to previous day
  const calculateCompletionRate = () => {
    const today = user?.problems_solved || 0;
    const yesterday = Math.max(0, today - 1); // Simulated previous day data
    const change = today - yesterday;
    return {
      rate: Math.min(100, Math.round((today / Math.max(1, today + 2)) * 100)), // Simulated completion rate
      change: change > 0 ? `+${change}` : change.toString(),
      isPositive: change >= 0
    };
  };

  const completionData = calculateCompletionRate();
  
  // Count in-progress courses
  const inProgressCourses = userCourses.filter(uc => !uc.is_completed).length;
  
  const stats = [
    { 
      id: 1, 
      title: 'Study Time', 
      value: formatTime(user?.total_study_time || 0), 
      change: '+15m', 
      isPositive: true, 
      icon: <Clock className="text-indigo-600 dark:text-indigo-400" /> 
    },
    { 
      id: 2, 
      title: 'Problems Solved', 
      value: (user?.problems_solved || 0).toString(), 
      change: '+1', 
      isPositive: true, 
      icon: <Target className="text-teal-600 dark:text-teal-400" /> 
    },
    { 
      id: 3, 
      title: 'Completion Rate', 
      value: `${completionData.rate}%`, 
      change: `${completionData.change}%`, 
      isPositive: completionData.isPositive, 
      icon: <PieChart className="text-amber-600 dark:text-amber-400" /> 
    },
    { 
      id: 4, 
      title: 'In Progress Courses', 
      value: inProgressCourses.toString(),
      change: '+1', 
      isPositive: true, 
      icon: <BookOpen className="text-emerald-600 dark:text-emerald-400" /> 
    },
  ];

  const handlePeriodChange = (period: string) => {
    setChartPeriod(period);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
            📊 Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Track your learning progress and achievements
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          <Calendar size={16} />
          <span>Last 30 Days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard 
            key={stat.id}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Learning Progress</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handlePeriodChange('week')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    chartPeriod === 'week' 
                      ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                      : darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Week
                </button>
                <button 
                  onClick={() => handlePeriodChange('month')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    chartPeriod === 'month' 
                      ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                      : darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Month
                </button>
                <button 
                  onClick={() => handlePeriodChange('year')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    chartPeriod === 'year' 
                      ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                      : darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
            <ProgressChart data={getChartData()} period={chartPeriod} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CoursesProgressCard />
            <LeaderboardCard />
          </div>
        </div>
        
        <div className="space-y-6">
          <StreakCard 
            streak={user?.current_streak || 1}
            longestStreak={user?.longest_streak || 3} 
            weeklyActivity={getWeeklyActivity()}
          />
          
          <DailyGoalCard />
          
          <AchievementCard recentAchievements={getRecentAchievements()} />
        </div>
      </div>

      {/* Motivational Quote Section */}
      <div className={`rounded-xl p-6 ${darkMode ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-800' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200'} shadow-sm`}>
        <div className="flex items-center justify-center">
          <div className="text-center max-w-2xl">
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full ${darkMode ? 'bg-indigo-800' : 'bg-indigo-100'}`}>
                <Zap className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
            </div>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💡 Daily Inspiration
            </h3>
            <blockquote className={`text-lg italic ${darkMode ? 'text-indigo-200' : 'text-indigo-800'} leading-relaxed`}>
              "{currentQuote}"
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;