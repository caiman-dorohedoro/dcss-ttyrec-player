import { useState, useEffect } from "react";
import "./App.css";
import TtyrecPlayer from "./components/TtyrecPlayer";
import FileUploader from "./components/FileUploader";
import Playlist from "./components/Playlist";
import { Button } from "./components/ui/button";
import { RotateCcw } from "lucide-react";
import { db } from "./lib/db";

const shortcuts = [
  { key: "space", description: "pause / resume" },
  { key: "f", description: "toggle fullscreen mode" },
  { key: "← / →", description: "rewind / fast-forward by 5 seconds" },
  { key: "Shift + ← / →", description: "rewind / fast-forward by 10%" },
  { key: "[ / ]", description: "jump to the previous / next marker" },
  { key: "0-9", description: "jump to 0%, 10%, 20% ... 90%" },
  {
    key: ", / .",
    description: "step back / forward, frame by frame (when paused)",
  },
  { key: "?", description: "toggle this help popup" },
];

const App = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [currentPosition, setCurrentPosition] = useState<number>(0);

  // 초기 로딩 시 저장된 파일들 불러오기
  useEffect(() => {
    const loadSavedFiles = async () => {
      try {
        const savedFiles = await db.getFiles();
        if (savedFiles.length > 0) {
          setSelectedFiles(
            savedFiles.map((file) => new File([file.blob], file.name))
          );
          setCurrentPosition(savedFiles[0].lastPosition);
        }
      } catch (error) {
        console.error("Error loading saved files:", error);
      }
    };

    loadSavedFiles();
  }, []);

  const handleFilesSelect = async (files: File[]) => {
    setSelectedFiles(files);
    setCurrentFileIndex(0);

    // 새로운 파일들을 DB에 저장
    for (const file of files) {
      await db.saveFile(file);
    }
  };

  const handlePositionUpdate = async (position: number) => {
    if (selectedFiles[currentFileIndex]) {
      await db.updatePosition(selectedFiles[currentFileIndex].name, position);
    }
  };

  const handleFileRemove = async (indexToRemove: number) => {
    const fileToRemove = selectedFiles[indexToRemove];
    await db.removeFile(fileToRemove.name);

    const updatedFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove
    );
    setSelectedFiles(updatedFiles);

    if (indexToRemove === currentFileIndex) {
      if (updatedFiles.length > 0) {
        setCurrentFileIndex(0);
      } else {
        setSelectedFiles([]);
      }
    } else if (indexToRemove < currentFileIndex) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  const handleReset = async () => {
    // 모든 파일 제거
    for (const file of selectedFiles) {
      await db.removeFile(file.name);
    }
    setSelectedFiles([]);
    setCurrentFileIndex(0);
    setCurrentPosition(0);
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

  return (
    <div className="relative mx-auto xl:py-8 py-4">
      <div className="mx-auto relative w-auto inline-flex items-center mb-4">
        <h1 className="xl:text-2xl text-lg font-bold text-center">
          Ttyrec Player
        </h1>
        {selectedFiles.length > 0 && (
          <Button
            size="sm"
            onClick={handleReset}
            className="absolute -right-[95px] cursor-pointer hover:bg-gray-100"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        )}
      </div>
      {!selectedFiles.length ? (
        <FileUploader onFileSelect={handleFilesSelect} />
      ) : (
        <div className="flex flex-col items-center xl:grid xl:grid-cols-[1fr_300px] xl:items-start gap-4">
          <TtyrecPlayer
            file={selectedFiles[currentFileIndex]}
            onEnded={playNextFile}
            initialPosition={currentPosition}
            onPositionUpdate={handlePositionUpdate}
          />
          <Playlist
            files={selectedFiles}
            currentFileIndex={currentFileIndex}
            onFileRemove={handleFileRemove}
            onFileSelect={(index) => setCurrentFileIndex(index)}
          />
        </div>
      )}
      {selectedFiles.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg mx-auto hidden sm:block lg:w-[500px] lg:max-w-[500px] xl:w-[896px] xl:max-w-[896px]">
          <h3 className="font-semibold mb-3">Keyboard shortcuts</h3>
          <div className="space-y-2 grid grid-cols-2 gap-2 ">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex text-sm">
                <kbd className="bg-gray-100 px-2 py-0.5 rounded mr-2 min-w-[80px] inline-block">
                  {shortcut.key}
                </kbd>
                <span className="text-gray-600">{shortcut.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
