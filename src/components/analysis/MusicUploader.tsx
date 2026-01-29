'use client';

import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from 'react';
import { Upload, Music, X, FileAudio } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MusicUploaderProps {
    onFileSelect: (file: File | null) => void;
    className?: string;
}

export function MusicUploader({ onFileSelect, className }: MusicUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        const selectedFile = acceptedFiles[0];

        if (selectedFile) {
            // Validate size (max 10MB for audio)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError("File is too large (max 10MB)");
                return;
            }
            setFile(selectedFile);
            onFileSelect(selectedFile);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/mpeg': ['.mp3'],
            'audio/wav': ['.wav'],
            'audio/ogg': ['.ogg']
        },
        maxFiles: 1,
        multiple: false
    });

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        onFileSelect(null);
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "group relative flex flex-col items-center justify-center w-full min-h-[250px] border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden",
                    isDragActive
                        ? "border-green-500 bg-green-500/10 shadow-[0_0_30px_-5px_var(--green-500)]"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10",
                    error && "border-red-500/50 bg-red-500/5"
                )}
            >
                <input {...getInputProps()} />

                {file ? (
                    <div className="relative w-full h-full min-h-[250px] flex flex-col items-center justify-center p-6 space-y-4 z-10">
                        {/* Glowing Effect Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-purple-500/5 animate-pulse" />

                        <div className="relative w-24 h-24 rounded-full bg-black/40 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
                            <div className="absolute inset-0 rounded-full border border-green-500/30 animate-ping opacity-20" />
                            <FileAudio className="w-10 h-10 text-green-400" />
                        </div>

                        <div className="text-center relative z-10">
                            <p className="text-lg font-bold text-white tracking-tight break-all max-w-[80%] mx-auto">
                                {file.name}
                            </p>
                            <p className="text-sm text-white/50 mt-1">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>

                        <button
                            onClick={clearFile}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-red-500/80 text-white transition-colors border border-white/10 z-20"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 relative z-10">
                        <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 mb-2",
                            isDragActive ? "bg-green-500 text-black scale-110" : "bg-white/5 text-white/40 group-hover:scale-110 group-hover:text-white group-hover:bg-white/10"
                        )}>
                            <Music className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-bold text-white tracking-tight">
                                {isDragActive ? "Drop the beat!" : "Upload your track"}
                            </p>
                            <p className="text-sm text-white/50 max-w-[200px] mx-auto leading-relaxed">
                                Drag & drop or click to upload MP3, WAV
                                <br />
                                <span className="text-xs text-white/30">(Max 10MB)</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Msg */}
                {error && (
                    <div className="absolute bottom-4 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-medium backdrop-blur-md z-20 animate-in fade-in slide-in-from-bottom-2">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
