import React from 'react';
import { Award } from 'lucide-react';
import { motion } from 'motion/react';

interface StreakBannerProps {
  streakDays?: number;
  totalDays?: number;
  adherencePercentage?: number;
  badgesEarned?: number;
}

export const StreakBanner: React.FC<StreakBannerProps> = ({
  streakDays = 7,
  totalDays = 7,
  adherencePercentage = 85,
  badgesEarned = 4,
}) => {
  const days = Array.from({ length: totalDays }, (_, i) => i < streakDays);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full h-[80px] rounded-[16px] overflow-hidden bg-gradient-to-r from-[#38ef7d] to-[#11998e] p-4 flex flex-col justify-between shadow-lg"
      id="streak-banner"
    >
      {/* Background Confetti Dots */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className="text-white font-bold text-[18px] leading-tight">
            🔥 {streakDays}-Day Streak! Keep it going!
          </h3>
        </div>

        {/* Day Circles */}
        <div className="flex gap-1.5 mt-1">
          {days.map((isCompleted, idx) => (
            <div 
              key={idx}
              className={`w-2.5 h-2.5 rounded-full border border-white ${isCompleted ? 'bg-white' : 'bg-transparent'}`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-end">
        {/* Progress Bar */}
        <div className="w-[60%] space-y-1">
          <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${adherencePercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-white"
            />
          </div>
        </div>

        {/* Badge Info */}
        <div className="flex items-center gap-1 text-white text-[13px] font-medium">
          <Award size={14} />
          <span>Badges: {badgesEarned} earned</span>
        </div>
      </div>
    </motion.div>
  );
};
