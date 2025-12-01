"use client";
import { useState } from "react";

interface ImageUploadProps {
  onUploadComplete: (base64: string) => void;
  currentImage?: string;
}

export default function ImageUpload({ onUploadComplete, currentImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploading(true);

    // Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onUploadComplete(base64String);
      setUploading(false);
    };
  }

  function handleRemove() {
    setPreview(null);
    onUploadComplete("");
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Game Image</label>
      
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded border" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transform translate-x-2 -translate-y-2"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-700"
          >
            {uploading ? "Processing..." : "Click to upload image"}
          </label>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>
      )}
    </div>
  );
}
