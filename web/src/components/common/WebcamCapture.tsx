import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';
import api from '../../services/api';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
    mode?: 'single' | 'attendance';
    classroomId?: string; // Add classroomId prop
    sessionId?: string;   // Add sessionId prop
    onFaceRecognized?: (face: any) => void;
}


const CameraCapture: React.FC<CameraCaptureProps> = ({
    onCapture,
    onClose,
    mode = 'single',
    classroomId,
    sessionId,
    onFaceRecognized
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [capturedFaces, setCapturedFaces] = useState<any[]>([]); // Store recognition results
    const [isAutoMode, setIsAutoMode] = useState(false); // Toggle for auto-capture


    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    setIsCameraReady(true);
                };
            }
            setError(null);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please ensure you've granted permission.");
        }
    }, []);

    const sendFrameToBackend = useCallback(async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        // Add context for attendance mode
        if (mode === 'attendance') {
            if (classroomId) formData.append('classroom_id', classroomId);
            if (sessionId) formData.append('session_id', sessionId);
        }

        // Determine endpoint based on mode
        const endpoint = mode === 'attendance'
            ? '/api/v1/faces/recognize-multi'
            : '/api/v1/faces/recognize';

        try {
            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                const data = response.data;
                console.log("Recognition result:", data);
                if (data.results && data.results.length > 0) {
                    setCapturedFaces(data.results);
                    // Notify parent about recognized faces
                    if (onFaceRecognized) {
                        data.results.forEach((face: any) => {
                            if (face.matched && face.student) {
                                onFaceRecognized(face);
                            }
                        });
                    }
                    // Optional: Provide visual feedback or auto-mark attendance here
                } else {
                    setCapturedFaces([]);
                }
            }
        } catch (error) {
            console.error("Error sending frame:", error);
        }
    }, [mode, classroomId, sessionId, onFaceRecognized]);

    const captureAndSendFrame = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "frame.jpg", { type: "image/jpeg" });
                        sendFrameToBackend(file);
                    }
                }, 'image/jpeg', 0.8);
            }
        }
    }, [sendFrameToBackend]);

    useEffect(() => {
        startCamera();

        // Cleanup function
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Auto-capture effect for attendance mode
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (mode === 'attendance' && isCameraReady && !capturedImage) {
            setIsAutoMode(true);

            intervalId = setInterval(() => {
                captureAndSendFrame();
            }, 2000); // 2 seconds interval
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [mode, isCameraReady, capturedImage, captureAndSendFrame]);




    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                // Set canvas dimensions to match video stream
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw current video frame to canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert to data URL for preview
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImage(dataUrl);

                // Stop camera stream immediately (turns off the light)
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    setStream(null);
                    setIsCameraReady(false);
                }
            }
        }
    };

    const handleConfirm = () => {
        if (capturedImage) {
            // Convert data URL to File object
            fetch(capturedImage)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file);
                    onClose();
                });
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl bg-gray-900 rounded-3xl overflow-hidden border border-gray-700 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Camera className="w-5 h-5 text-violet-400" />
                        {mode === 'attendance' ? 'Attendance Scanner' : 'Take Photo'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Camera Viewport */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    {error ? (
                        <div className="text-center p-6">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button
                                onClick={startCamera}
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            {!capturedImage ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className={`w-full h-full object-cover transform transition-opacity duration-300 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
                                />
                            ) : (
                                <img
                                    src={capturedImage}
                                    alt="captured"
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {!isCameraReady && !error && !capturedImage && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                                </div>
                            )}
                        </>
                    )}

                    <canvas ref={canvasRef} className="hidden" />

                    {/* Overlay for Recognized Faces */}
                    {isAutoMode && capturedFaces.map((face, index) => (
                        <div
                            key={index}
                            className={`absolute border-2 rounded-lg transition-all duration-300 pointer-events-none ${face.attendance === 'marked' ? 'border-green-500' :
                                face.attendance === 'already_marked' ? 'border-blue-500' :
                                    'border-yellow-500'
                                }`}
                            style={{
                                left: `${(face.box[0] / (videoRef.current?.videoWidth || 1)) * 100}%`,
                                top: `${(face.box[1] / (videoRef.current?.videoHeight || 1)) * 100}%`,
                                width: `${(face.box[2] / (videoRef.current?.videoWidth || 1)) * 100}%`,
                                height: `${(face.box[3] / (videoRef.current?.videoHeight || 1)) * 100}%`,
                            }}
                        >
                            {face.matched && face.student && (
                                <div className={`absolute -top-8 left-0 text-white text-xs px-2 py-1 rounded ${face.attendance === 'marked' ? 'bg-green-500' :
                                    face.attendance === 'already_marked' ? 'bg-blue-500' :
                                        'bg-yellow-500'
                                    }`}>
                                    {face.student.full_name} ({Math.round(face.similarity * 100)}%)
                                    {face.attendance === 'already_marked' && ' (Already Marked)'}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="p-6 bg-gray-900/50 backdrop-blur-md border-t border-gray-800">
                    <div className="flex items-center justify-center gap-4">
                        {!capturedImage ? (
                            <button
                                onClick={capturePhoto}
                                disabled={!isCameraReady}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                            >
                                <Camera size={20} />
                                {mode === 'attendance' ? 'Stop Scanning' : 'Capture'}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleRetake}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all border border-gray-700"
                                >
                                    <RefreshCw size={18} />
                                    Retake
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold shadow-lg shadow-green-500/20 transition-all active:scale-95"
                                >
                                    <Check size={20} />
                                    Use Photo
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CameraCapture;
