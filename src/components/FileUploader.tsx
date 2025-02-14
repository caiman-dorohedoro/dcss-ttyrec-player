import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

// FileUploader 컴포넌트
const FileUploader = ({ onFileSelect }: { onFileSelect: (files: File[]) => void }) => {
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
    handleFiles(Array.from(files));
  };
  
  const handleFiles = (files: File[]) => { // files: File[] 타입으로 변경
    if (!files || files.length === 0) return; // files 가 비어있는 경우 처리

    const validFiles = files.filter(file => file.name.endsWith('.ttyrec') || file.name.endsWith('.ttyrec.bz2')); // 유효한 파일만 필터링
    if (validFiles.length !== files.length) { // 유효하지 않은 파일이 있는 경우 alert 표시
      alert('Please upload .ttyrec or .ttyrec.bz2 files only.');
      return;
    }

    onFileSelect(validFiles); // 유효한 파일들만 onFileSelect 으로 전달
  };


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    handleFiles(Array.from(files)); // FileList -> Array<File> 로 변환하여 handleFiles 호출
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
          multiple
        />
      </div>
    </div>
  );
};

export default FileUploader;