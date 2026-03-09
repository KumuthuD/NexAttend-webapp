import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { Trophy } from 'lucide-react';

export interface StudentRanking {
    id: string;
    name: string;
    avatar?: string;
    score: number;
}

interface StudentRankingListProps {
    students?: StudentRanking[];
    className?: string;
}

// Removed mock data array to ensure real time data alone is used.

// Helper component to animate counting up to the score
const CountUp: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1.5 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration,
            ease: "easeOut",
            onUpdate: (latest) => setCount(Math.round(latest)),
        });

        return () => controls.stop();
    }, [value, duration]);

    return <>{count}</>;
};

const StudentRankingList: React.FC<StudentRankingListProps> = ({
    students = [],
    className = ''
}) => {
    // Sort students by score descending
    const sortedStudents = [...students].sort((a, b) => b.score - a.score).slice(0, 5); // Show top 5

    const getRankColor = (index: number) => {
        switch (index) {
            case 0: return 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-[0_0_15px_rgba(251,191,36,0.6)] border border-amber-200/50'; // Gold
            case 1: return 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900 shadow-[0_0_15px_rgba(156,163,175,0.4)] border border-white/50';   // Silver
            case 2: return 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 shadow-[0_0_15px_rgba(249,115,22,0.4)] border border-orange-200/50'; // Bronze
            default: return 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400';
        }
    };

    const getProgressBarColor = (index: number) => {
        switch (index) {
            case 0: return 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]';
            case 1: return 'bg-gradient-to-r from-gray-300 to-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.5)]';
            case 2: return 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
            default: return 'bg-gradient-to-r from-violet-400 to-violet-600';
        }
    };

    return (
        <div className={`group/card relative overflow-hidden flex flex-col h-full bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            Top Attendees
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Based on attendance</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {sortedStudents.map((student, index) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            key={student.id}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100/50 dark:hover:bg-white/[0.04] border border-transparent hover:border-white/40 dark:hover:border-white/[0.08] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-none group/row transform hover:-translate-y-0.5"
                        >
                            {/* Rank Badge */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-transform duration-300 group-hover/row:scale-110 group-hover/row:-rotate-6 ${getRankColor(index)}`}>
                                {index + 1}
                            </div>

                            {/* Student Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover/row:text-violet-600 dark:group-hover/row:text-violet-400 transition-colors">
                                    {student.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="w-full bg-gray-100 dark:bg-white/[0.06] rounded-full h-1.5 max-w-[100px] overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${student.score}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                                            className={`h-1.5 rounded-full ${getProgressBarColor(index)}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Score */}
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-sm font-bold ${index < 3 ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                    <CountUp value={student.score} />%
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {sortedStudents.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                            <p className="text-sm">No ranking data available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentRankingList;
