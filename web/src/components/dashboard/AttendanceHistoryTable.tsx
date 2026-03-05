import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export interface AttendanceRecord {
    id: string;
    date: string;           // ISO date string e.g. "2026-02-18"
    classroom_id?: string;
    classroom_name: string;
    presentCount: number;
    totalCount: number;
}

interface AttendanceHistoryTableProps {
    records: AttendanceRecord[];
    isLoading?: boolean;
    className?: string;
}

// ── Skeleton row shown while loading ──────────────────────────────────────────
const SkeletonRow = ({ index }: { index: number }) => (
    <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
        className="border-b border-gray-100 dark:border-white/[0.05]"
    >
        {[1, 2, 3, 4].map((col) => (
            <td key={col} className="px-4 py-4">
                <div className="h-4 bg-gray-100 dark:bg-white/[0.06] rounded-lg animate-pulse" />
            </td>
        ))}
    </motion.tr>
);

// ── Percentage bar ────────────────────────────────────────────────────────────
const PercentageBar = ({ present, total }: { present: number, total: number }) => {
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-orange-500';
    return (
        <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{pct}%</span>
        </div>
    );
};

// ── Format date helper ────────────────────────────────────────────────────────
const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Main component ────────────────────────────────────────────────────────────
const AttendanceHistoryTable: React.FC<AttendanceHistoryTableProps> = ({
    records,
    isLoading = false,
    className = '',
}) => {
    const COLUMNS = ['Date', 'Classroom', 'Present Students', 'Percentage', ''];
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className={`bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02]">
                            {COLUMNS.map((col) => (
                                <th
                                    key={col}
                                    className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {/* Loading state */}
                        {isLoading && Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonRow key={i} index={i} />
                        ))}

                        {/* Empty state */}
                        {!isLoading && records.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-5 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                                            <BookOpen className="w-6 h-6 text-violet-500 dark:text-violet-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No attendance records found</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">Records will appear here once attendance sessions are completed.</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Data rows */}
                        {!isLoading && records.map((record, index) => (
                            <motion.tr
                                key={record.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.04 }}
                                className="border-b border-gray-50 dark:border-white/[0.04] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors duration-150"
                            >
                                {/* Date */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                        <span className="font-medium tabular-nums text-xs sm:text-sm">{formatDate(record.date)}</span>
                                    </div>
                                </td>

                                {/* Classroom Name */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]">
                                            {record.classroom_name}
                                        </span>
                                    </div>
                                </td>

                                {/* Marked Students */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {record.presentCount}/{record.totalCount} Students
                                        </span>
                                    </div>
                                </td>

                                {/* Percentage */}
                                <td className="px-4 py-4">
                                    <PercentageBar present={record.presentCount} total={record.totalCount} />
                                </td>

                                {/* Action */}
                                <td className="px-4 py-4 content-center">
                                    {user?.role === 'teacher' && record.classroom_id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/manual-review/${record.classroom_id}`);
                                            }}
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs border bg-white dark:bg-white/5 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-300 dark:hover:border-amber-500/30 w-auto"
                                            title="Manual Review"
                                        >
                                            <span>View List</span>
                                        </button>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer row count */}
            {!isLoading && records.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/40 dark:bg-white/[0.01]">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{records.length}</span> record{records.length !== 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AttendanceHistoryTable;
