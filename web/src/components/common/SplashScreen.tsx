import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import splashLogo from '../../assets/images/logo.png';

const SplashScreen: React.FC = () => {
  const [dots, setDots] = useState('');

  // Animate the "..." dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 180);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 overflow-hidden"
    >
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 -top-24 -left-24 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute w-72 h-72 -bottom-16 -right-16 rounded-full bg-pink-600/15 blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(139,92,246,0.15) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(139,92,246,0.15) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">

        {/* "Loading..." heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-baseline gap-0"
        >
          <span className="text-3xl md:text-4xl font-semibold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-pink-300 to-violet-300">
            Loading
          </span>
          {/* Fixed-width dot area so text doesn't shift */}
          <span
            className="text-3xl md:text-4xl font-semibold text-violet-300 inline-block"
            style={{ minWidth: '2.5rem', textAlign: 'left' }}
          >
            {dots}
          </span>
        </motion.div>

        {/* NexAttend Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="relative"
        >
          {/* Glow behind logo */}
          <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-2xl scale-110 pointer-events-none" />
          <img
            src={splashLogo}
            alt="NexAttend Logo"
            className="relative w-36 md:w-48 drop-shadow-[0_0_24px_rgba(139,92,246,0.5)]"
          />
        </motion.div>
      </div>

      {/* Progress bar at bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500"
        />
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
