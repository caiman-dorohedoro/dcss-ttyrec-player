import React from "react";
import { XCircle } from "lucide-react";

interface PlaylistProps {
  className?: string;
  files: File[];
  currentFileIndex: number;
  onFileRemove: (index: number) => void;
  onFileSelect: (index: number) => void;
}

const Playlist: React.FC<PlaylistProps> = ({
  files,
  currentFileIndex,
  onFileRemove,
  onFileSelect,
  className,
}) => {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-2">플레이리스트</h2>
      {/* <h2 className="text-lg font-semibold mb-2">Playlist</h2> */}
      {files.length > 0 ? (
        <ul className="border rounded-md overflow-hidden">
          {files.map((file, index) => (
            <li
              key={index}
              className={`xl:max-w-[300px] max-w-[700px] px-4 py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-100 ${
                currentFileIndex === index ? "bg-blue-100" : ""
              } flex items-center justify-between`}
              onClick={() => onFileSelect(index)}
            >
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
