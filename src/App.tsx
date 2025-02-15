import { useState } from "react";
import "./App.css";
import TtyrecPlayer from "./components/TtyrecPlayer";
import FileUploader from "./components/FileUploader";
import Playlist from "./components/Playlist";
import { Button } from "./components/ui/button";
import { RotateCcw } from "lucide-react";

const App = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);

  const handleFilesSelect = (files: File[]) => {
    setSelectedFiles(files);
    setCurrentFileIndex(0); // 파일 선택 시 첫 번째 파일부터 재생 시작
  };

  const playNextFile = () => {
    if (currentFileIndex < selectedFiles.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    } else {
      // 마지막 파일 재생 완료 후 처리 (예: 재생 중지, 반복 재생 등)
      console.log("Playlist finished");
      setCurrentFileIndex(0); // 예시: playlist finished 후 다시 처음 파일부터 재생
      setSelectedFiles([]); // 예시: playlist finished 후 파일 목록 초기화
    }
  };

  const handleFileRemove = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove
    );
    setSelectedFiles(updatedFiles);
    if (indexToRemove === currentFileIndex) {
      if (updatedFiles.length > 0) {
        setCurrentFileIndex(0); // 삭제된 파일이 현재 파일이면, 다음 파일 (또는 첫 번째 파일) 재생
      } else {
        setSelectedFiles([]); // 파일 모두 삭제되면 selectedFiles 초기화
      }
    } else if (indexToRemove < currentFileIndex) {
      setCurrentFileIndex(currentFileIndex - 1); // 현재 index 조정
    }
  };

  return (
    <div className="relative mx-auto md:py-8 py-4">
      <div className="mx-auto relative w-auto inline-flex items-center mb-4">
        <h1 className="md:text-2xl text-lg font-bold text-center">
          Ttyrec Player
        </h1>
        {selectedFiles.length > 0 && (
          <Button
            size="sm"
            onClick={() => setSelectedFiles([])}
            className="absolute -right-[95px] cursor-pointer hover:bg-gray-100"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        )}
      </div>
      {!selectedFiles.length ? (
        <FileUploader onFileSelect={handleFilesSelect} />
      ) : (
        <>
          <TtyrecPlayer
            file={selectedFiles[currentFileIndex]}
            onEnded={playNextFile}
          />
          <Playlist
            className="md:absolute md:-right-40 md:top-7 mx-4 my-8"
            files={selectedFiles}
            currentFileIndex={currentFileIndex}
            onFileRemove={handleFileRemove}
            onFileSelect={(index) => setCurrentFileIndex(index)}
          />
        </>
      )}
    </div>
  );
};

export default App;
