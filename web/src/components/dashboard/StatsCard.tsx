import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number; // e.g., +5.2 or -2.1
        label: string; // e.g., "vs last week"
    };
    color?: string; // Tailwind text color class, e.g., "text-violet-600"
    bg?: string; // Tailwind bg color class, e.g., "bg-violet-50"
    delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color = '', bg = '', delay = 0 }) => {
    const isPositive = trend && trend.value >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="group relative overflow-hidden bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-500"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-start justify-between z-10">
                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{title}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</span>
                        {trend && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${isPositive ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300' : 'text-rose-700 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-300'}`}>
                                {isPositive ? '+' : ''}{trend.value}%
                            </span>
                        )}
                    </div>
                    {trend && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">{trend.label}</p>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-2xl ${bg} ${color} shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ring-1 ring-white/50 dark:ring-white/10`}>
                        {icon}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StatsCard;
