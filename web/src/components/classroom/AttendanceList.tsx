import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    time: string;
    status: 'present' | 'late';
    avatar?: string;
    isFlagged?: boolean;
}

interface AttendanceListProps {
    students: Student[];
}

const AttendanceList: React.FC<AttendanceListProps> = ({ students }) => {
    return (
        <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col h-full shadow-sm transition-colors duration-300">
            <div className="p-4 border-b border-gray-100 dark:border-white/[0.06]">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                    Live Attendance
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {students.length} students marked present
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                <AnimatePresence mode='popLayout'>
                    {students.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center justify-center h-full text-center p-4"
                        >
                            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                                <Clock size={24} className="text-gray-300 dark:text-gray-600" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Waiting for students...
                            </p>
                        </motion.div>
                    ) : (
                        students.map((student) => (
                            <motion.div
                                key={student.id}
                                layout
                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm">
                                        {student.avatar ? (
                                            <img src={student.avatar} alt={student.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            student.name.charAt(0)
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {student.name}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Clock size={12} className="text-gray-400" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {student.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {student.isFlagged && (
                                        <div className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                                            <AlertTriangle size={12} />
                                            Flagged
                                        </div>
                                    )}
                                    <div className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${student.status === 'present'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                                        }`}>
                                        <CheckCircle size={12} />
                                        {student.status === 'present' ? 'Present' : 'Late'}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AttendanceList;
