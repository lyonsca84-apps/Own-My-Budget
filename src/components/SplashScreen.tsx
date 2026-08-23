import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Lock, DollarSign } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-[#9B59B6] flex flex-col items-center justify-center overflow-hidden">
      {/* Radial Glow */}
      <div className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl relative"
        >
          <div className="flex items-center justify-center text-[#9B59B6]">
            <DollarSign size={64} strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* Text Content */}
        <div className="space-y-2">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white text-[36px] font-bold tracking-tight"
            style={{ fontFamily: '"Neue Montreal", sans-serif' }}
          >
            Own My Budget
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-white/80 text-[18px]"
            style={{ fontFamily: '"Neue Montreal", sans-serif' }}
          >
            Clarity starts here.
          </motion.p>
        </div>
      </div>

      {/* Loading Bar */}
      <div className="absolute bottom-16 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="w-full h-full bg-white"
        />
      </div>
    </div>
  );
};
