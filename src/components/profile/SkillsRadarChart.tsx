import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface SkillsDisplayProps {
  skills: Array<{
    name: string;
    value: number;
  }>;
}

const SkillsDisplay: React.FC<SkillsDisplayProps> = ({ skills }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className="space-y-4">
      {skills.map((skill, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {skill.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {skill.value}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${skill.value}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillsDisplay;