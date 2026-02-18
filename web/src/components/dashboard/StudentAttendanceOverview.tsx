import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface StudentAttendanceOverviewProps {
    attendancePercentage: number;
    totalClasses: number;
    presentCount: number;
    absentCount: number;
}

const StudentAttendanceOverview: React.FC<StudentAttendanceOverviewProps> = ({
    attendancePercentage,
    totalClasses,
    presentCount,
    absentCount
}) => {
    // Determine color based on percentage
    const getColor = (percentage: number) => {
        if (percentage >= 80) return { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500', lightBg: 'bg-emerald-50 dark:bg-emerald-500/10' };
        if (percentage >= 60) return { text: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-500', lightBg: 'bg-yellow-50 dark:bg-yellow-500/10' };
        return { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500', lightBg: 'bg-red-50 dark:bg-red-500/10' };
    };

    const color = getColor(attendancePercentage);

    // Circular progress calculation
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (attendancePercentage / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1e2028] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 mb-8"
        >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Overall Status */}
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-100 dark:text-gray-700"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={progressOffset}
                                strokeLinecap="round"
                                className={`${color.text} transition-all duration-1000 ease-out`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className={`text-xl font-bold ${color.text}`}>{attendancePercentage}%</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Attendance Overview</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {attendancePercentage >= 80 ? 'Excellent attendance! Keep it up.' :
                                attendancePercentage >= 60 ? 'Good attendance, but room for improvement.' :
                                    'Your attendance is low. Please attend more classes.'}
                        </p>
                    </div>
                </div>

                {/* Vertical Divider (Hidden on mobile) */}
                <div className="hidden md:block w-px h-16 bg-gray-200 dark:bg-white/10"></div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-8 w-full md:w-auto">
                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2 mx-auto">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{totalClasses}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Classes</div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2 mx-auto">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{presentCount}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Present</div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 mb-2 mx-auto">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{absentCount}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Absent</div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default StudentAttendanceOverview;
