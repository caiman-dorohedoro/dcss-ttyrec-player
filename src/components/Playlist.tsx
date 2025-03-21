import React, { useEffect } from "react";
import { Package, PackageOpen, XCircle } from "lucide-react";
import { States } from "@/types/decompressWorker";
import { cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

interface PlaylistProps {
  className?: string;
  status: States;
  files: File[];
  cachedFileNames: string[];
  currentFileIndex: number;
  onFileRemove: (index: number) => void;
  onFileSelect: (index: number) => void;
  isMergeMode: boolean;
  selectedMergeFiles: File[];
  onMergeFileSelect: (index: number) => void;
  onBatchSelect: () => void;
}

const Playlist: React.FC<PlaylistProps> = ({
  files,
  cachedFileNames,
  status,
  currentFileIndex,
  onFileRemove,
  onFileSelect,
  className,
  isMergeMode,
  selectedMergeFiles,
  onMergeFileSelect,
  onBatchSelect,
}) => {
  const isCompressedFile = (fileName: string) => {
    return fileName.endsWith(".bz2");
  };

  const isDecompressedResultCachedFile = (fileName: string) => {
    return isCompressedFile(fileName) && cachedFileNames.includes(fileName);
  };

  const handleClick = (index: number) => {
    if (isMergeMode) {
      onMergeFileSelect(index);
    } else {
      onFileSelect(index);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {files.length > 0 ? (
        <ul className="border rounded-md overflow-hidden max-h-[546px] overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent">
          {isMergeMode && (
            <li className="px-2 py-2 gap-x-2 flex justify-start items-center">
              <Checkbox
                id="batch-select"
                className="w-[22px] h-[22px]"
                checked={selectedMergeFiles.length === files.length}
                onCheckedChange={onBatchSelect}
              />
              <Label
                className="hover:cursor-pointer hover:text-gray-500"
                htmlFor="batch-select"
              >
                전체 선택
              </Label>
            </li>
          )}
          {files.map((file, index) => (
            <li
              key={index}
              className={`xl:max-w-[300px] max-w-[700px] px-2 py-2 gap-x-0.5 border-b last:border-b-0  hover:bg-gray-100 ${
                !isMergeMode && currentFileIndex === index ? "bg-blue-100" : ""
              } 
              ${
                status === States.DECOMPRESSING && currentFileIndex !== index
                  ? "cursor-not-allowed bg-gray-100"
                  : "cursor-pointer"
              }
              ${isMergeMode && "gap-x-1"}
              flex items-center justify-between`}
              onClick={() => handleClick(index)}
            >
              {isMergeMode && (
                <>
                  <Checkbox
                    className="w-[22px] h-[22px] hover:cursor-pointer"
                    checked={selectedMergeFiles.includes(file)}
                    onCheckedChange={() => onMergeFileSelect(index)}
                    checkEl={
                      <span className="text-xs">
                        {selectedMergeFiles.findIndex((f) => f === file) + 1}
                      </span>
                    }
                  ></Checkbox>
                </>
              )}
              {isCompressedFile(file.name) &&
                !isDecompressedResultCachedFile(file.name) && (
                  <Package className="min-w-6 min-h-6 w-6 h-6" />
                )}
              {isDecompressedResultCachedFile(file.name) && (
                <PackageOpen className="min-w-6 min-h-6 w-6 h-6" />
              )}
              <span className="truncate">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 이벤트 버블링 방지
                  onFileRemove(index);
                }}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-4 w-4 cursor-pointer" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-center p-4">파일을 선택해주세요.</p>
      )}
    </div>
  );
};

export default Playlist;
