import { useState } from 'react'
import './App.css'
import TtyrecPlayer from './components/TtyrecPlayer'
import FileUploader from './components/FileUploader'
import Playlist from './components/\bPlaylist';

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
      console.log('Playlist finished');
      setCurrentFileIndex(0); // 예시: playlist finished 후 다시 처음 파일부터 재생
      setSelectedFiles([]); // 예시: playlist finished 후 파일 목록 초기화
    }
  };
  
  const handleFileRemove = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
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
    <div className="relative mx-auto md:py-8 py-1">
      <h1 className="md:text-2xl text-lg font-bold md:mb-6 my-2 text-center">TTYRec Player</h1>
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
          <button
            onClick={() => setSelectedFiles([])}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Upload Another File
          </button>
        </>
      )}
    </div>
  );
};


export default App
