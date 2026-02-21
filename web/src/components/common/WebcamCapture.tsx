
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';
import * as faceapi from 'face-api.js'; // Import face-api for client-side detection
import api from '../../services/api';

// Interface for face recognition result from backend
interface FaceResult {
    box: [number, number, number, number];
    matched: boolean;
    student?: {
        full_name: string;
        student_id: string;
        _id: string;
    };
    similarity: number;
    attendance?: 'marked' | 'already_marked' | 'pending';
}

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
    mode?: 'single' | 'attendance';
    classroomId?: string;
    sessionId?: string;
    onFaceRecognized?: (face: FaceResult) => void;
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
    const [capturedFaces, setCapturedFaces] = useState<FaceResult[]>([]); // Backend results
    const [isAutoMode, setIsAutoMode] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false); // Track if AI models are ready

    // 1. Load Face-API Models on Mount
    // Load the TinyFaceDetector model (lightweight, runs fast in browser)
    useEffect(() => {
        const loadModels = async () => {
            try {
                // Wait for model files to load from public/models
                await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                console.log("FaceAPI models loaded successfully");
                setModelsLoaded(true);
            } catch (err) {
                console.error("Failed to load AI models - Check public/models folder", err);
            }
        };
        loadModels();
    }, []);

    // 2. Start Camera Stream
    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, // Lower resolution for speed
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

    // 3. Send Frame to Backend for Recognition (Slow Loop ~2s)
    const sendFrameToBackend = useCallback(async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        if (mode === 'attendance') {
            if (classroomId) formData.append('classroom_id', classroomId);
            if (sessionId) formData.append('session_id', sessionId);
        }

        const endpoint = mode === 'attendance' ? '/api/v1/faces/recognize-multi' : '/api/v1/faces/recognize';

        try {
            const response = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 200) {
                const data = response.data;
                // Update global state with latest recognized faces
                if (data.results && data.results.length > 0) {
                    setCapturedFaces(data.results);
                    if (onFaceRecognized) {
                        data.results.forEach((face: any) => {
                            if (face.matched && face.student) onFaceRecognized(face);
                        });
                    }
                } else {
                     setCapturedFaces([]);
                }
            }
        } catch (error) {
            console.error("Error/Timeout sending frame:", error);
        }
    }, [mode, classroomId, sessionId, onFaceRecognized]);

    const captureAndSendFrame = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas'); // Use off-screen canvas for backend processing
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "frame.jpg", { type: "image/jpeg" });
                    sendFrameToBackend(file);
                }
            }, 'image/jpeg', 0.8);
        }
    }, [sendFrameToBackend]);


    // 4. Real-time Detection Loop (Fast Loop 30ms)
    // This runs continuously to draw bounding boxes that follow faces smoothly.
    useEffect(() => {
        let animationFrameId: number;

        const detectFacesLoop = async () => {
            if (!videoRef.current || !canvasRef.current || !modelsLoaded || !isCameraReady) {
                 animationFrameId = requestAnimationFrame(detectFacesLoop);
                 return;
            }

            // Get video dimensions
            const video = videoRef.current;
            if (video.paused || video.ended) return;

            // Detect faces locally using face-api.js (Fast!)
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
            const detections = await faceapi.detectAllFaces(video, options);

            // Resize detections to match video size
            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvasRef.current, displaySize);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            // Clear previous drawings
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);

            // Draw bounding boxes for each detected face
            if (isAutoMode) {
                resizedDetections.forEach((det) => {
                    const { x, y, width, height } = det.box;
                    
                    // Match specific backend result to this local box (by proximity)
                    // We find the backend face whose center is closest to this local box's center
                    let bestMatch = null;
                    let minDist = Infinity;
                    const cx = x + width / 2;
                    const cy = y + height / 2;

                    capturedFaces.forEach((backendFace) => {
                         const [bx, by, bw, bh] = backendFace.box;
                         const bcx = bx + bw / 2;
                         const bcy = by + bh / 2;
                         const dist = Math.sqrt(Math.pow(cx - bcx, 2) + Math.pow(cy - bcy, 2));
                         
                         // Threshold: backend face must be reasonably close (e.g. within 100px)
                         // Note: Backend box coordinates might be scaled differently if resolution changed?
                         // Assuming consistent 640x480 or similar aspect ratio.
                         if (dist < 150 && dist < minDist) {
                             minDist = dist;
                             bestMatch = backendFace;
                         }
                    });

                    // Draw the box
                    ctx!.strokeStyle = bestMatch?.matched ? '#22c55e' : '#eab308'; // Green if matched, Yellow if unknown
                    ctx!.lineWidth = 2;
                    ctx!.strokeRect(x, y, width, height);

                    // Draw Label if matched
                    if (bestMatch && bestMatch.matched && bestMatch.student) {
                         const text = `${bestMatch.student.full_name} (${Math.round(bestMatch.similarity * 100)}%)`;
                         ctx!.fillStyle = '#22c55e';
                         ctx!.font = '16px Inter sans-serif';
                         ctx!.fillText(text, x, y - 10);
                    }
                });
            }
            
            animationFrameId = requestAnimationFrame(detectFacesLoop);
        };

        if (isAutoMode && modelsLoaded) {
            detectFacesLoop();
        }

        return () => {
             cancelAnimationFrame(animationFrameId);
        };
    }, [isAutoMode, modelsLoaded, isCameraReady, capturedFaces]); // Relies on capturedFaces updating via backend loop

    // Setup backend polling loop
    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (mode === 'attendance' && isCameraReady && !capturedImage) {
            setIsAutoMode(true);
            intervalId = setInterval(() => {
                captureAndSendFrame();
            }, 2000); // Send frame every 2 seconds
        }
        return () => clearInterval(intervalId);
    }, [mode, isCameraReady, capturedImage, captureAndSendFrame]);

    // Initial load
    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // ... (capturePhoto, handleConfirm, handleRetake functions same as before)
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImage(dataUrl);
                 if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    setStream(null); setIsCameraReady(false); setIsAutoMode(false);
                }
            }
        }
    };

    const handleConfirm = () => {
        if (capturedImage) {
            fetch(capturedImage).then(res => res.blob()).then(blob => {
                const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                onCapture(file); onClose();
            });
        }
    };

    const handleRetake = () => { setCapturedImage(null); startCamera(); };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl bg-gray-900 rounded-3xl overflow-hidden border border-gray-700 shadow-2xl">
                 {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Camera className="w-5 h-5 text-violet-400" />
                        {mode === 'attendance' ? 'Attendance Scanner' : 'Take Photo'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Camera Viewport */}
                {/* Use object-contain to ensure video isn't cropped, keeping boxes aligned */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    {error ? (
                        <div className="text-center p-6"><p className="text-red-400 mb-4">{error}</p><button onClick={startCamera} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">Try Again</button></div>
                    ) : (
                        <>
                            {!capturedImage ? (
                                <>
                                   {/* Video Element */}
                                    <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-contain transform transition-opacity duration-300 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`} />
                                    {/* Canvas Overlay for FaceAPI Boxes */}
                                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
                                </>
                            ) : (
                                <img src={capturedImage} alt="captured" className="w-full h-full object-cover" />
                            )}

                            {(!isCameraReady || (!modelsLoaded && isAutoMode)) && !error && !capturedImage && (
                                <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                                    <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                                    <p className="text-violet-400 text-sm font-medium">{!modelsLoaded ? 'Loading AI Models...' : 'Starting Camera...'}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Controls */}
                <div className="p-6 bg-gray-900/50 backdrop-blur-md border-t border-gray-800">
                    <div className="flex items-center justify-center gap-4">
                        {!capturedImage ? (
                            mode === 'attendance' ? (
                                <button onClick={onClose} className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold shadow-lg shadow-red-500/20 transition-all active:scale-95 hover:shadow-red-500/30">
                                    <X size={20} /> Stop Attendance
                                </button>
                            ) : (
                                <button onClick={capturePhoto} disabled={!isCameraReady} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100">
                                    <Camera size={20} /> Capture
                                </button>
                            )
                        ) : (
                            <>
                                <button onClick={handleRetake} className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all border border-gray-700"><RefreshCw size={18} /> Retake</button>
                                <button onClick={handleConfirm} className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold shadow-lg shadow-green-500/20 transition-all active:scale-95"><Check size={20} /> Use Photo</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CameraCapture;
