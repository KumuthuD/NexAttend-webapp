import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number; // e.g., +5.2 or -2.1
        label: string; // e.g., "vs last week"
    };
    color: string; // Tailwind text color class, e.g., "text-violet-600"
    bg: string; // Tailwind bg color class, e.g., "bg-violet-50"
    delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color, bg, delay = 0 }) => {
    const isPositive = trend && trend.value >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white dark:bg-[#1a1d2e] rounded-2xl p-6 border border-gray-100 dark:border-white/[0.06] shadow-sm hover:shadow-md transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
                        {trend && (
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isPositive ? 'text-green-600 bg-green-50 dark:bg-green-500/10' : 'text-red-600 bg-red-50 dark:bg-red-500/10'}`}>
                                {isPositive ? '+' : ''}{trend.value}%
                            </span>
                        )}
                    </div>
                    {trend && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{trend.label}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color}`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
};

export default StatsCard;
