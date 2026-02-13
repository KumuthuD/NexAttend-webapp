import React from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import splashLogo from '../../assets/images/logo.png';

const SplashScreen: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 overflow-hidden"
        >
            {/* Background Logo */}
             <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.1, scale: 1.2 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <img 
                    src={splashLogo} 
                    alt="" 
                    className="w-[80vw] max-w-2xl opacity-60"
                />
            </motion.div>

            {/* Foreground Text */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, letterSpacing: "0.05em" }}
                animate={{ opacity: 1, scale: 1, letterSpacing: "0.1em" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center"
            >
                <h1 className="text-4xl md:text-6xl font-sans font-light text-white tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 drop-shadow-lg">
                    NexAttend
                </h1>
            </motion.div>
        </motion.div>
    );
};

export default SplashScreen;
