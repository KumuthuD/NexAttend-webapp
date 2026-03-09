import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    classroomName: string;
}

const DeleteClassroomModal: React.FC<DeleteClassroomModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    classroomName,
}) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            // Error is handled by the parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06]">
                <div className="p-6 sm:p-8 text-center">
                    {/* Icon */}
                    <div className="mx-auto w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center mb-5">
                        <AlertTriangle className="w-7 h-7 text-red-500 dark:text-red-400" />
                    </div>

                    {/* Content */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Delete Classroom?
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                        Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-gray-200">{classroomName}</span>? This action cannot be undone and will remove all associated data.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-red-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteClassroomModal;
