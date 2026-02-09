import React, { useState } from 'react';

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

        // Validate classroom name
        if (!classroomName.trim()) {
            setError('Classroom name is required');
            return;
        }

        // Submit the form
        onSubmit(classroomName.trim());

        // Reset form
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl p-8">
                {/* Modal Title */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Crate New Classroom
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Input Label */}
                    <label
                        htmlFor="classroomName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Classroom Name
                    </label>

                    {/* Input Field */}
                    <input
                        id="classroomName"
                        type="text"
                        value={classroomName}
                        onChange={(e) => {
                            setClassroomName(e.target.value);
                            setError('');
                        }}
                        placeholder="Enter classroom name"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none text-black"
                        autoFocus
                    />

                    {/* Error Message */}
                    {error && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-between items-center mt-6 gap-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-8 py-2.5 text-gray-400 center rounded-lg hover:text-gray-600 border-2 border-gray-300 hover:border-gray-600 font-medium transition-colors hover:shadow-lg cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 bg-[#5663CD] hover:bg-[#4552BC] text-white center rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg cursor-pointer"
                        >
                            Create Classroom
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateClassroomModal;
