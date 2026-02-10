import React from 'react';
import { Users, ArrowRight } from 'lucide-react';

interface ClassroomCardProps {
    title: string;
    studentCount: number;
    accessCode: string;
    icon?: React.ReactNode;
    actionButtonText: string;
    onAction: () => void;
    colorClass?: string;
    iconBgClass?: string;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({
    title,
    studentCount,
    accessCode,
    icon,
    actionButtonText,
    onAction,
    colorClass = 'text-gray-800',
    iconBgClass = 'bg-violet-50'
}) => {
    return (
        <div
            className="group relative bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-white/[0.06] hover:border-violet-200 dark:hover:border-violet-500/25 transition-all duration-300 flex flex-col h-full min-h-[240px] overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-violet-500/[0.06] dark:hover:shadow-violet-500/[0.08]"
            onClick={onAction}
        >
            {/* Subtle top accent bar */}
            <div className="h-1 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="p-6 flex-1 flex flex-col">
                {/* Header row */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/10 flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-500/15 transition-colors duration-300">
                            {icon || <Users size={22} className="text-violet-500 dark:text-violet-400" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white leading-tight transition-colors duration-300">{title}</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 transition-colors duration-300">Classroom</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-6">
                    <div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{studentCount}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium transition-colors duration-300">Students</p>
                    </div>
                    <div className="w-px h-8 bg-gray-100 dark:bg-white/[0.06] transition-colors duration-300" />
                    <div>
                        <p className="text-sm font-mono font-semibold text-violet-600 dark:text-violet-400 transition-colors duration-300">{accessCode}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium transition-colors duration-300">Access Code</p>
                    </div>
                </div>

                {/* Action */}
                <div className="mt-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAction(); }}
                        className="w-full py-2.5 px-4 bg-violet-50 hover:bg-violet-600 dark:bg-violet-500/10 dark:hover:bg-violet-500 text-violet-600 hover:text-white dark:text-violet-400 dark:hover:text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border border-violet-100 hover:border-violet-600 dark:border-violet-500/15 dark:hover:border-violet-500 text-sm group/btn"
                    >
                        <span>{actionButtonText}</span>
                        <ArrowRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassroomCard;
