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
            className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center h-full min-h-[250px] cursor-pointer hover:bg-gray-50 transition-colors border-2 border-transparent hover:border-indigo-100"
        >
            <div className="mb-4">
                <Plus size={48} className="text-black" />
            </div>
            <h3 className="text-lg font-bold text-center text-black">
                {type === 'create' ? 'Create new Classroom' : 'Join new Classroom'}
            </h3>
        </div>
    );
};

export default AddClassroomCard;
