import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    maxFiles?: number;
    minFiles?: number;
    label?: string;
    error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    files,
    onFilesChange,
    maxFiles = 5,
    minFiles = 3,
    label = "Upload Images",
    error
}) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const validateFile = (file: File) => {
        // Validate type
        if (!file.type.startsWith('image/')) {
            return false;
        }
        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return false;
        }
        return true;
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files).filter(validateFile);

            // Limit total files
            const totalFiles = [...files, ...newFiles].slice(0, maxFiles);
            onFilesChange(totalFiles);
        }
    }, [files, maxFiles, onFilesChange]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).filter(validateFile);
            const totalFiles = [...files, ...newFiles].slice(0, maxFiles);
            onFilesChange(totalFiles);
        }
    }, [files, maxFiles, onFilesChange]);

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFilesChange(newFiles);
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label} <span className="text-gray-500 text-xs">(Min: {minFiles}, Max: {maxFiles})</span>
            </label>

            <div
                className={`
                    relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ease-in-out
                    ${dragActive ? 'border-violet-500 bg-violet-500/10' : 'border-gray-700 hover:border-violet-400 hover:bg-gray-800/50'}
                    ${error ? 'border-red-500 bg-red-500/5' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleChange}
                    accept="image/*"
                />

                <div className="flex flex-col items-center justify-center text-center cursor-pointer">
                    <div className={`p-3 rounded-full mb-3 ${dragActive ? 'bg-violet-500/20 text-violet-300' : 'bg-gray-800 text-gray-400'}`}>
                        <UploadCloud size={24} />
                    </div>
                    <p className="text-sm text-gray-300 font-medium">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        SVG, PNG, JPG or GIF (max. 5MB)
                    </p>
                </div>
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-500 animate-fade-in">
                    {error}
                </p>
            )}

            {/* Image Preview Grid */}
            {files.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4 animate-fade-in">
                    {files.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                            <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
