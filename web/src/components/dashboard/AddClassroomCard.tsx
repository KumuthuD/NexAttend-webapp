import React from 'react';
import { Plus } from 'lucide-react';

interface AddClassroomCardProps {
    type: 'create' | 'join';
    onClick: () => void;
}

const AddClassroomCard: React.FC<AddClassroomCardProps> = ({ type, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group relative bg-white/50 dark:bg-white/[0.02] rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/[0.08] hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-300 flex flex-col items-center justify-center h-full min-h-[240px] cursor-pointer hover:bg-violet-50/50 dark:hover:bg-violet-500/[0.03]"
        >
            <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-500/10 group-hover:border-violet-200 dark:group-hover:border-violet-500/20 transition-all duration-300">
                    <Plus size={24} className="text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-300" />
                </div>
                <div className="text-center">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-white transition-colors duration-300">
                        {type === 'create' ? 'Create new Classroom' : 'Join new Classroom'}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1 transition-colors duration-300">
                        {type === 'create' ? 'Set up a new class space' : 'Enter an access code'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AddClassroomCard;
