import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

// FileUploader 컴포넌트
const FileUploader = ({ onFileSelect }: { onFileSelect: (file: File) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    handleFiles(files);
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (!file.name.endsWith('.ttyrec') && !file.name.endsWith('.ttyrec.bz2')) {
      alert('Please upload a .ttyrec or .ttyrec.bz2 file');
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop your TTYRec file here, or click to select
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supports .ttyrec and .ttyrec.bz2 files
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".ttyrec,.bz2"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FileUploader;