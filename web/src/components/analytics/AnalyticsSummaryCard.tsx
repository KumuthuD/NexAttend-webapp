import React from 'react';
import { motion } from 'framer-motion';

interface AnalyticsSummaryCardProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

const AnalyticsSummaryCard: React.FC<AnalyticsSummaryCardProps> = ({
    title,
    subtitle,
    children,
    delay = 0,
    className = '',
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`group relative overflow-hidden bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">{title}</h3>
                        {subtitle && (
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>
                {children}
            </div>
        </motion.div>
    );
};

export default AnalyticsSummaryCard;
