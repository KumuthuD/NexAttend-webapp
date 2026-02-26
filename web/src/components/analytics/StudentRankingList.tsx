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

// Mock data to use when actual data is unavailable
const MOCK_STUDENTS: StudentRanking[] = [
    { id: '1', name: 'Yasith Peiris', score: 98 },
    { id: '2', name: 'Kumuthu Dahanayake', score: 95 },
    { id: '3', name: 'Thiviru Igalawithana', score: 92 },
    { id: '4', name: 'Sudam Amarajeewa', score: 88 },
    { id: '5', name: 'Thisandu Ranadheera', score: 85 }
];

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
    students = MOCK_STUDENTS,
    className = ''
}) => {
    // Sort students by score descending
    const sortedStudents = [...students].sort((a, b) => b.score - a.score).slice(0, 5); // Show top 5

    const getRankColor = (index: number) => {
        switch (index) {
            case 0: return 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'; // Gold
            case 1: return 'bg-gray-200 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400';   // Silver
            case 2: return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'; // Bronze
            default: return 'bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400';
        }
    };

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-[#1a1d2e] rounded-2xl p-6 border border-gray-100 dark:border-white/[0.06] shadow-sm transition-colors duration-300 ${className}`}>

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
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] border border-transparent hover:border-gray-100 dark:hover:border-white/[0.05] transition-all group"
                    >
                        {/* Rank Badge */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(index)}`}>
                            {index + 1}
                        </div>

                        {/* Student Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {student.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-full bg-gray-100 dark:bg-white/[0.06] rounded-full h-1.5 max-w-[100px] overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${student.score}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                                        className="bg-violet-500 dark:bg-violet-400 h-1.5 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
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
    );
};

export default StudentRankingList;
