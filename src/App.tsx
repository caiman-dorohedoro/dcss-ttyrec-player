import { useEffect, useRef, useState } from "react";
import "./App.css";
import TtyrecPlayer from "./components/TtyrecPlayer";
import FileUploader from "./components/FileUploader";
import Playlist from "./components/Playlist";
import { Button } from "./components/ui/button";
import { RotateCcw } from "lucide-react";
import Title from "@/components/Title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useBz2DecompressWorker from "./hooks/useBz2DecompressWorker";
import { States } from "./types/decompressWorker";
import Search from "./components/Search";
import { formatSize } from "./lib/utils";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";
import mergeTtyrecFiles from "./lib/mergeTtyrecs";
import Dialog from "./components/Dialog";
import Shortcuts from "./components/Shortcuts";

const App = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [tab, setTab] = useState<"playlist" | "search">("playlist");
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [safeFile, setSafeFile] = useState<File | Blob | null>(null);
  const {
    result,
    status,
    decompressFile,
    batchResults,
    decompressBatch,
    cacheStats,
    clearCache,
    cachedFileNames,
  } = useBz2DecompressWorker();
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const playerRef = useRef<any>(null);
  const [selectedMergeFiles, setSelectedMergeFiles] = useState<File[]>([]);
  const [isMergeMode, setIsMergeMode] = useState<boolean>(false);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogTitle, setDialogTitle] = useState<string>("");
  const [dialogDescription, setDialogDescription] = useState<string>("");

  const handleFilesSelect = (files: File[]) => {
    setSelectedFiles(files);
    setCurrentFileIndex(0); // 파일 선택 시 첫 번째 파일부터 재생 시작
    setSelectedMergeFiles([]); // 파일 선택 시 병합 모드 해제
    setIsMergeMode(false);
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

  const handleMergeFileSelect = (index: number) => {
    if (selectedMergeFiles.includes(selectedFiles[index])) {
      setSelectedMergeFiles(
        selectedMergeFiles.filter((file) => file !== selectedFiles[index])
      );
    } else {
      setSelectedMergeFiles([...selectedMergeFiles, selectedFiles[index]]);
    }
  };

  // 파일 병합 함수
  const handleMergeFiles = async () => {
    setIsMerging(true);

    try {
      // 압축 파일이 있는지 확인
      const compressedFiles = selectedMergeFiles.filter((file) =>
        file.name.endsWith(".bz2")
      );

      if (compressedFiles.length > 0) {
        // 압축 파일이 있는 경우 모두 압축 해제 먼저 진행
        await decompressBatch(compressedFiles);
      } else {
        // 압축 파일이 없는 경우 바로 병합 진행
        await processMergeWithFiles(selectedMergeFiles);
      }
    } catch (error) {
      console.error("파일 병합 중 오류 발생:", error);
      setDialogTitle("파일 병합 중 오류 발생");
      setDialogDescription("파일 병합 중 오류가 발생했습니다.");
      setShowDialog(true);
      setIsMerging(false);
    }
  };

  // 압축 해제된 파일 결과를 처리하는 함수
  const processMergeWithDecompressedFiles = async () => {
    if (!batchResults) return;

    try {
      // 압축 해제된 파일과 기존 비압축 파일 합치기
      const nonCompressedFiles = selectedMergeFiles.filter(
        (file) => !file.name.endsWith(".bz2")
      );

      // 압축 해제된 파일과 비압축 파일 합치기
      const allFiles = [
        ...nonCompressedFiles,
        ...batchResults.blobs.map((blob, index) => {
          // 원본 파일명에서 .bz2 확장자 제거
          const originalName = batchResults.originalFiles[index].name;
          const cleanName = originalName.endsWith(".bz2")
            ? originalName.slice(0, -4)
            : originalName;

          return new File([blob], cleanName, { type: blob.type });
        }),
      ];

      // 병합 처리
      await processMergeWithFiles(allFiles);
    } catch (error) {
      console.error("압축 해제 후 병합 중 오류 발생:", error);
      setDialogTitle("파일 병합 중 오류 발생");
      setDialogDescription("압축 해제 후 병합 중 오류가 발생했습니다.");
      setShowDialog(true);
      setIsMerging(false);
    }
  };

  // 실제 파일 병합을 처리하는 함수
  const processMergeWithFiles = async (files: File[]) => {
    try {
      const fileBuffers = await Promise.all(
        files.map(async (file) => {
          return await loadFileBuffer(file);
        })
      );

      // firstFileName__lastFileName.ttyrec
      const fileName = files.reduce((acc, file, index) => {
        if (index === 0) {
          return file.name.replace(".ttyrec", "");
        }

        if (index === files.length - 1) {
          return `${acc}__${file.name.replace(".ttyrec", "")}`;
        }

        return acc;
      }, "");

      const mergedBuffer = mergeTtyrecFiles(fileBuffers);

      const mergedBlob = new Blob([mergedBuffer], {
        type: "application/octet-stream",
      });
      const mergedFile = new File([mergedBlob], `${fileName}.ttyrec`, {
        type: "application/octet-stream",
      });

      // 병합된 파일을 선택된 파일 목록으로 설정
      setSelectedFiles([mergedFile]);
      setCurrentFileIndex(0);
      setSelectedMergeFiles([]);
      setIsMergeMode(false);

      // 성공 메시지
      setDialogTitle("파일 병합 완료");
      setDialogDescription("파일이 성공적으로 병합되었습니다.");
      setShowDialog(true);
    } catch (error) {
      console.error("파일 병합 중 오류 발생:", error);
      setDialogTitle("파일 병합 중 오류 발생");
      setDialogDescription("파일 병합 중 오류가 발생했습니다.");
      setShowDialog(true);
    } finally {
      setIsMerging(false);
    }
  };

  // 파일 버퍼 로드 함수
  const loadFileBuffer = async (file: File | Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("파일을 ArrayBuffer로 변환할 수 없습니다."));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleBatchSelect = () => {
    if (selectedMergeFiles.length === selectedFiles.length) {
      setSelectedMergeFiles([]);
      return;
    }

    if (selectedMergeFiles.length !== 0) {
      setSelectedMergeFiles((_selectedFiles) => {
        const notSelectedFiles = selectedFiles.filter(
          (file) => !_selectedFiles.includes(file)
        );

        return [..._selectedFiles, ...notSelectedFiles];
      });
      return;
    }

    setSelectedMergeFiles(selectedFiles);
  };

  const handleReset = () => {
    clearCache();
    setSelectedFiles([]);
    setCurrentFileIndex(0);
    setSelectedMergeFiles([]);
  };

  useEffect(() => {
    const currentFile = selectedFiles[currentFileIndex];

    if (!currentFile) return;

    const isCompressed = currentFile.name.endsWith(".bz2");

    if (!isCompressed) {
      setSafeFile(currentFile);
      return;
    }

    decompressFile(currentFile);
  }, [currentFileIndex, selectedFiles, decompressFile]);

  useEffect(() => {
    if (status === States.COMPLETED) {
      setSafeFile(result);
    }
  }, [status, result]);

  // 배치 압축 해제 결과 감시를 위한 새로운 useEffect
  useEffect(() => {
    if (batchResults && isMerging) {
      processMergeWithDecompressedFiles();
    }
  }, [batchResults]);

  return (
    <div className="relative mx-auto xl:py-8 py-4">
      <div className="flex justify-end gap-2 mb-2">
        {cacheStats && (
          <>
            <div className="text-xs text-gray-500 text-right">
              압축 해제 캐시: {formatSize(cacheStats.currentSize)} /{" "}
              {formatSize(cacheStats.maxSize)}
            </div>
            <div className="bg-gray-200 w-[1px] h-3 self-center"></div>
          </>
        )}
        <div className="text-right text-xs text-gray-500 lg:mr-0 mr-2">
          <a
            href="https://github.com/caiman-dorohedoro/dcss-ttyrec-player"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center hover:text-gray-400 transition-colors"
          >
            <span>GitHub</span>
          </a>
        </div>
      </div>
      <div className="mx-auto lg:relative w-auto inline-flex items-center mb-4">
        <h1 className="xl:text-2xl text-lg font-bold text-center">
          <Title />
        </h1>
        {selectedFiles.length > 0 && (
          <div className="absolute right-[20px] lg:-right-[150px] flex gap-2">
            <Button size="sm" onClick={handleReset} className="cursor-pointer">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden lg:inline"> 초기화</span>
            </Button>
          </div>
        )}
      </div>
      {!selectedFiles.length ? (
        <FileUploader onFileSelect={handleFilesSelect} />
      ) : (
        <div className="flex flex-col items-center xl:grid xl:grid-cols-[1fr_300px] xl:items-start gap-4">
          <TtyrecPlayer
            ref={playerRef}
            file={safeFile}
            status={status}
            onEnded={playNextFile}
          />
          <Tabs
            defaultValue="playlist"
            onValueChange={(value) => setTab(value as "playlist" | "search")}
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="playlist" className="hover:cursor-pointer">
                  플레이리스트
                </TabsTrigger>
                <TabsTrigger value="search" className="hover:cursor-pointer">
                  검색
                </TabsTrigger>
              </TabsList>
              {tab === "playlist" && (
                <div className="flex items-center hover:cursor-pointer hover:text-gray-700">
                  <Label
                    htmlFor="merge-mode"
                    className="hover:cursor-pointer pr-2"
                  >
                    병합 모드
                  </Label>
                  <Switch
                    id="merge-mode"
                    className="hover:cursor-pointer hover:text-gray-500"
                    disabled={isMerging}
                    checked={isMergeMode}
                    onCheckedChange={setIsMergeMode}
                  />
                </div>
              )}
            </div>
            <TabsContent value="playlist">
              <div className="flex flex-col gap-2">
                <Playlist
                  files={selectedFiles}
                  cachedFileNames={cachedFileNames}
                  status={status}
                  currentFileIndex={currentFileIndex}
                  onFileRemove={handleFileRemove}
                  onFileSelect={(index) => setCurrentFileIndex(index)}
                  isMergeMode={isMergeMode}
                  isMerging={isMerging}
                  selectedMergeFiles={selectedMergeFiles}
                  onMergeFileSelect={(index) => handleMergeFileSelect(index)}
                  onBatchSelect={handleBatchSelect}
                />
                {isMergeMode && (
                  <Button
                    disabled={selectedMergeFiles.length < 2 || isMerging}
                    className="hover:cursor-pointer"
                    onClick={handleMergeFiles}
                  >
                    파일 병합
                  </Button>
                )}
              </div>
            </TabsContent>
            <TabsContent value="search">
              <Search
                playerRef={playerRef}
                file={safeFile}
                decompressStatus={status}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
      {selectedFiles.length > 0 && <Shortcuts />}
      <Dialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title={dialogTitle}
        description={dialogDescription}
        cancelText="확인"
      />
    </div>
  );
};

export default App;
