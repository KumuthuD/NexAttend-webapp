
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Student } from '../types';
import { recognizeStudents } from '../services/geminiService';
import { CameraIcon, XMarkIcon } from './icons';

interface AttendanceTakerProps {
  students: Student[];
  onClose: () => void;
  onAttendanceUpdate: (presentStudentIds: string[]) => void;
}

const AttendanceTaker: React.FC<AttendanceTakerProps> = ({ students, onClose, onAttendanceUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsLoading(true);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if(context){
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    const classroomImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
    
    try {
      const presentStudentIds = await recognizeStudents(classroomImageBase64, students);
      onAttendanceUpdate(presentStudentIds);
      onClose();
    } catch (err) {
      setError("Failed to process attendance. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-violet-400 mb-4">Take Attendance</h2>
        <div className="bg-gray-900 rounded-md overflow-hidden aspect-video mb-4">
          <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${!isCameraOn && 'hidden'}`}></video>
          {!isCameraOn && !error && <div className="w-full h-full flex items-center justify-center text-gray-500">Starting camera...</div>}
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <canvas ref={canvasRef} className="hidden"></canvas>
        <button
          onClick={handleCapture}
          disabled={!isCameraOn || isLoading}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <CameraIcon className="w-6 h-6" />
              Capture & Mark Attendance
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AttendanceTaker;
