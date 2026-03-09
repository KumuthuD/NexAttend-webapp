import React, { useState } from 'react';
import { X, BookOpen, Hash, FileText, Calendar } from 'lucide-react';
import { ClassroomCreateData } from '../../services/api';

//  Teacher Mode 
interface CreateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'join';
    onCreateSubmit?: (data: ClassroomCreateData) => Promise<void>;
    onJoinSubmit?: (accessCode: string) => Promise<void>;
}

const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({
    isOpen,
    onClose,
    mode,
    onCreateSubmit,
    onJoinSubmit,
}) => {
    // Teacher create form
    const [name, setName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [description, setDescription] = useState('');
    const [schedule, setSchedule] = useState('');

    // Student join form
    const [accessCode, setAccessCode] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setName('');
        setCourseCode('');
        setDescription('');
        setSchedule('');
        setAccessCode('');
        setError('');
        setLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) handleClose();
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Classroom name is required'); return; }
        if (!courseCode.trim()) { setError('Course code is required'); return; }

        setLoading(true);
        setError('');
        try {
            await onCreateSubmit?.({
                name: name.trim(),
                course_code: courseCode.trim().toUpperCase(),
                description: description.trim() || undefined,
                schedule: schedule.trim() || undefined,
            });
            resetForm();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to create classroom. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessCode.trim()) { setError('Access code is required'); return; }

        setLoading(true);
        setError('');
        try {
            await onJoinSubmit?.(accessCode.trim().toUpperCase());
            resetForm();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Invalid access code. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-md mx-4 bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06]">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {mode === 'create' ? 'Create New Classroom' : 'Join a Classroom'}
                        </h2>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all duration-200"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* ── Teacher: Create Form ── */}
                    {mode === 'create' && (
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            {/* Classroom Name */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                    
                                    Classroom Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError(''); }}
                                    placeholder="e.g. Advanced Algorithms"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-500/10 transition-all duration-200 text-sm"
                                    autoFocus
                                    disabled={loading}
                                />
                            </div>

                            {/* Course Code */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                    
                                    Course Code <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={courseCode}
                                    onChange={(e) => { setCourseCode(e.target.value); setError(''); }}
                                    placeholder="e.g. CS301"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-500/10 transition-all duration-200 text-sm"
                                    disabled={loading}
                                />
                            </div>

                            {/* Description (optional) */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                    
                                    Description <span className="text-gray-400 dark:text-gray-600 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Covers sorting, graph algorithms..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-500/10 transition-all duration-200 text-sm"
                                    disabled={loading}
                                />
                            </div>

                            {/* Schedule (optional) */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                    
                                    Schedule <span className="text-gray-400 dark:text-gray-600 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={schedule}
                                    onChange={(e) => setSchedule(e.target.value)}
                                    placeholder="e.g. Mon / Wed 10:00 AM"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-500/10 transition-all duration-200 text-sm"
                                    disabled={loading}
                                />
                            </div>

                            <p className="text-xs text-gray-400 dark:text-gray-500 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 rounded-lg px-3 py-2">
                                  An access code will be <strong>auto-generated</strong> and shown on the classroom card after creation.
                            </p>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div className="flex justify-center items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="px-8 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 font-medium transition-all duration-200 text-sm disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-violet-200 dark:shadow-violet-500/20 text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : 'Create Classroom'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── Student: Join Form ── */}
                    {mode === 'join' && (
                        <form onSubmit={handleJoinSubmit} className="space-y-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                    
                                    Access Code <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={accessCode}
                                    onChange={(e) => { setAccessCode(e.target.value.toUpperCase()); setError(''); }}
                                    placeholder="Enter 6-character code e.g. AB12CD"
                                    maxLength={8}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] rounded-xl text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-500/10 transition-all duration-200 text-sm font-mono tracking-widest uppercase"
                                    autoFocus
                                    disabled={loading}
                                />
                            </div>

                            <p className="text-xs text-gray-400 dark:text-gray-500 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg px-3 py-2">
                                  Get the access code from your teacher or module coordinator.
                            </p>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div className="flex justify-center items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="px-8 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 font-medium transition-all duration-200 text-sm disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-violet-200 dark:shadow-violet-500/20 text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Joining...
                                        </>
                                    ) : 'Join Classroom'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateClassroomModal;
