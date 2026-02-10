import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (classroomName: string) => void;
}

const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [classroomName, setClassroomName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!classroomName.trim()) {
            setError('Classroom name is required');
            return;
        }

        onSubmit(classroomName.trim());
        setClassroomName('');
        setError('');
        onClose();
    };

    const handleClose = () => {
        setClassroomName('');
        setError('');
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Create New Classroom
                        </h2>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-200"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <label
                            htmlFor="classroomName"
                            className="block text-sm font-medium text-gray-500 mb-2"
                        >
                            Classroom Name
                        </label>

                        <input
                            id="classroomName"
                            type="text"
                            value={classroomName}
                            onChange={(e) => {
                                setClassroomName(e.target.value);
                                setError('');
                            }}
                            placeholder="e.g. Advanced Algorithms"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200"
                            autoFocus
                        />

                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}

                        <div className="flex justify-center items-center mt-8 gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-10 py-2.5 text-gray-500 hover:text-gray-700 rounded-xl border border-gray-200 hover:border-gray-300 font-medium transition-all duration-200 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-violet-200 text-sm"
                            >
                                Create Classroom
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateClassroomModal;
