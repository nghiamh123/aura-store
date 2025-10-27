"use client";

import { Image as ImageIcon, X } from "lucide-react";
import { useRef, useState } from "react";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function FileUpload({
  onUploadComplete,
  onUploadError,
  accept = "image/*",
  maxSize = 10,
  className = "",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      onUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace("*", ".*"))) {
      onUploadError("Invalid file type");
      return;
    }

    setIsUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      // Step 1: Get presigned URL from backend
      const presignResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads/presign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            filename: file.name,
          }),
        }
      );

      if (!presignResponse.ok) {
        throw new Error("Failed to get presigned URL");
      }

      const { url, fields, finalUrl } = await presignResponse.json();

      // Step 2: Upload file to S3 using presigned URL
      const formData = new FormData();

      // Add all the fields from presigned URL
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      // Add the file
      formData.append("file", file);

      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Return the final URL
      onUploadComplete(finalUrl || `${url}/${fields.key}`);
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            onClick={clearFile}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </button>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Uploading...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`
            w-full h-48 border-2 border-dashed border-gray-300 rounded-lg
            flex flex-col items-center justify-center cursor-pointer
            hover:border-gray-400 transition-colors
            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {isUploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">Max size: {maxSize}MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
