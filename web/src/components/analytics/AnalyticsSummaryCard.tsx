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
            className={`bg-white dark:bg-[#1a1d2e] rounded-2xl p-6 border border-gray-100 dark:border-white/[0.06] shadow-sm transition-colors duration-300 ${className}`}
        >
            <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
                {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
                )}
            </div>
            {children}
        </motion.div>
    );
};

export default AnalyticsSummaryCard;
