import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

const FileUploader = ({
  onFileSelect,
}: {
  onFileSelect: (files: File[]) => void;
}) => {
  useTranslation();
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

  const handleFiles = (files: File[]) => {
    if (!files || files.length === 0) return;

    const validFiles = files.filter(
      (file) =>
        file.name.endsWith(".ttyrec") || file.name.endsWith(".ttyrec.bz2")
    );

    if (validFiles.length !== files.length) {
      alert("Please upload .ttyrec or .ttyrec.bz2 files only.");
      return;
    }

    onFileSelect(validFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert FileList to Array<File> and call handleFiles
    handleFiles(Array.from(files));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          <Trans
            i18nKey="fileUploader.dragAndDrop"
            components={{ code: <code className="bg-gray-100" /> }}
          />
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
