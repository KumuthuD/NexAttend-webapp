import React from 'react';
import { Users } from 'lucide-react';

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
    iconBgClass = 'bg-orange-100'
}) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[250px]">
            <h3 className={`text-xl font-bold mb-4 ${colorClass}`}>{title}</h3>

            <div className="flex items-start space-x-4 mb-6">
                <div className={`p-3 rounded-xl ${iconBgClass} flex-shrink-0`}>
                    {icon || <Users size={24} className="text-gray-600" />}
                </div>
                <div>
                    <p className="font-bold text-gray-900">{studentCount} Students</p>
                    <p className="text-sm text-gray-500">Access Code : {accessCode}</p>
                </div>
            </div>

            <div className="mt-auto">
                <button
                    onClick={onAction}
                    className="w-full py-3 px-4 bg-[#5663CD] hover:bg-[#4552BC] text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors"
                >
                    {/* Camera icon wrapper if needed, for now just text/icon from usage */}
                    {actionButtonText.includes('Start') && (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    )}
                    <span>{actionButtonText}</span>
                </button>
            </div>
        </div>
    );
};

export default ClassroomCard;
