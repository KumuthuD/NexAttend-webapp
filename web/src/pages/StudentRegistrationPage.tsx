import React, { useState } from 'react';
import { UserPlus, Save, AlertCircle } from 'lucide-react';
import Input from '../components/common/Input';
import CameraCapture from '../components/common/WebcamCapture';
import api, { registerStudent } from '../services/api';

const StudentRegistrationPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        roll_number: '',
        email: '',
        course: '',
        year: 1,
    });
    const [capturedImage, setCapturedImage] = useState<File | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCapture = (file: File) => {
        setCapturedImage(file);
        setShowCamera(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!capturedImage) {
            setMessage({ type: 'error', text: 'Please capture a photo for facial recognition' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('roll_number', formData.roll_number);
            data.append('email', formData.email);
            data.append('course', formData.course);
            data.append('year', formData.year.toString());
            data.append('file', capturedImage);

            await registerStudent(data);

            setMessage({ type: 'success', text: 'Student registered successfully!' });
            // Reset form
            setFormData({ name: '', roll_number: '', email: '', course: '', year: 1 });
            setCapturedImage(null);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to register student. Please try again.' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
                    <div className="px-8 py-6 border-b border-gray-700 bg-gray-900/50">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <UserPlus className="text-violet-500" />
                            Student Registration
                        </h2>
                        <p className="mt-1 text-gray-400">Register a new student with facial data</p>
                    </div>

                    <div className="p-8">
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                <AlertCircle size={20} />
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                    required
                                />
                                <Input
                                    label="Roll Number"
                                    name="roll_number"
                                    value={formData.roll_number}
                                    onChange={handleInputChange}
                                    placeholder="e.g. ST2024001"
                                    required
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="student@university.edu"
                                    required
                                />
                                <Input
                                    label="Course"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Computer Science"
                                    required
                                />
                                <Input
                                    label="Year"
                                    name="year"
                                    type="number"
                                    value={formData.year.toString()}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 1"
                                    required
                                />
                            </div>

                            <div className="border-t border-gray-700 pt-6">
                                <label className="block text-sm font-medium text-gray-300 mb-4">
                                    Face Registration Data
                                </label>

                                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-xl bg-gray-900/30 hover:bg-gray-900/50 transition-colors">
                                    {capturedImage ? (
                                        <div className="text-center">
                                            <div className="w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-violet-500 shadow-lg shadow-violet-500/30">
                                                <img
                                                    src={URL.createObjectURL(capturedImage)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowCamera(true)}
                                                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                                            >
                                                Retake Photo
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                                                <UserPlus size={32} />
                                            </div>
                                            <p className="text-gray-400 mb-4">No face data captured yet</p>
                                            <button
                                                type="button"
                                                onClick={() => setShowCamera(true)}
                                                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium border border-gray-600"
                                            >
                                                Open Camera
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {loading ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Register Student
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showCamera && (
                <CameraCapture
                    onCapture={handleCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}
        </div>
    );
};

export default StudentRegistrationPage;
