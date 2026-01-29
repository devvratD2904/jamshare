'use client';

import { useDropzone } from 'react-dropzone';
import { useCallback, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
    value?: string | null;
    onChange: (base64: string | null) => void;
    label?: string;
    className?: string;
}

export function ImageDropzone({ value, onChange, label = "Upload Image", className }: ImageDropzoneProps) {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [error, setError] = useState<string | null>(null);

    // Sync external value changes
    useEffect(() => {
        setPreview(value || null);
    }, [value]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        const file = acceptedFiles[0];

        if (file) {
            // Validate size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError("File is too large (max 2MB)");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setPreview(result);
                onChange(result); // Pass base64 back
            };
            reader.readAsDataURL(file);
        }
    }, [onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/webp': [],
            'image/gif': []
        },
        maxFiles: 1,
        multiple: false
    });

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onChange(null);
    };

    return (
        <div className={cn("space-y-3", className)}>
            {label && <p className="text-sm font-medium text-white/60">{label}</p>}

            <div
                {...getRootProps()}
                className={cn(
                    "group relative flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden",
                    isDragActive
                        ? "border-primary bg-primary/10 shadow-[0_0_30px_-5px_var(--primary)]"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10",
                    error && "border-red-500/50 bg-red-500/5"
                )}
            >
                <input {...getInputProps()} />

                {preview ? (
                    <div className="relative w-full h-full min-h-[200px] flex items-center justify-center p-6">
                        {/* Preview Avatar or Image */}
                        <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-black shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        </div>

                        {/* Vibe overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <p className="text-white font-medium">Change Vibe</p>
                        </div>

                        {/* Clear Button */}
                        <button
                            onClick={clearImage}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-red-500/80 text-white transition-colors border border-white/10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                            isDragActive ? "bg-primary text-black" : "bg-white/5 text-white/40 group-hover:scale-110 group-hover:text-white"
                        )}>
                            <Upload className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-bold text-white tracking-tight">
                                {isDragActive ? "Drop the vibe!" : "Drag & drop or click"}
                            </p>
                            <p className="text-sm text-white/50">
                                Upload your avatar (max 2MB)
                            </p>
                        </div>
                    </div>
                )}

                {/* Neon Error Msg */}
                {error && (
                    <div className="absolute bottom-4 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-medium backdrop-blur-md">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
