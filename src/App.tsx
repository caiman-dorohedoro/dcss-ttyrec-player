import { useEffect, useRef, useState } from "react";
import "./App.css";
import TtyrecPlayer from "./components/TtyrecPlayer";
import FileUploader from "./components/FileUploader";
import Playlist from "./components/Playlist";
import { Button } from "./components/ui/button";
import { RotateCcw, GitMerge } from "lucide-react";
import DrawDCSSCharacters, { ColorMaps } from "./components/Icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useBz2DecompressWorker from "./hooks/useBz2DecompressWorker";
import { States } from "./types/decompressWorker";
import Search from "./components/Search";
import { formatSize } from "./lib/utils";
// import mergeTtyrecFiles from "./lib/mergeTtyrecs";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";
import mergeTtyrecFiles from "./lib/mergeTtyrecs";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";

const shortcuts = [
  // { key: "space", description: "pause / resume" },
  { key: "space", description: "플레이 / 정지" },
  // { key: "f", description: "toggle fullscreen mode" },
  { key: "f", description: "전체 화면 모드 전환" },
  // { key: "← / →", description: "rewind / fast-forward by 5 seconds" },
  { key: "← / →", description: "5초 뒤로 / 5초 앞으로" },
  // { key: "Shift + ← / →", description: "rewind / fast-forward by 10%" },
  { key: "Shift + ← / →", description: "10% 뒤로 / 10% 앞으로" },
  // { key: "[ / ]", description: "jump to the previous / next marker" },
  { key: "[ / ]", description: "이전 / 다음 마크로 이동" },
  // { key: "0-9", description: "jump to 0%, 10%, 20% ... 90%" },
  { key: "0-9", description: "0%, 10%, 20% ... 90%로 이동" },
  // { key: ", / .", description: "step back / forward, frame by frame (when paused)" },
  {
    key: ", / .",
    description: "(일시정지 상태에서) 프레임 단위로 뒤로 / 앞으로",
  },
  // { key: "?", description: "toggle this help popup" },
  { key: "?", description: "도움말 표시 / 숨김" },
];

const logoChars = [
  {
    char: "@",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg["#d9d9d9"],
  },
  {
    char: ".",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg["#d9d9d9"],
  },
  {
    char: ".",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg["#d9d9d9"],
  },
  {
    char: ".",
    fgColor: ColorMaps.fg["#d9d9d9"],
    bgColor: ColorMaps.bg.black,
  },
  {
    char: " ",
  },
];

const titleChars = [
  {
    char: "T",
    fgColor: ColorMaps.fg["#ddaf3c"],
    bgColor: ColorMaps.bg.black,
  },
  {
    char: "†",
    fgColor: ColorMaps.fg["#26b0d7"],
    bgColor: ColorMaps.bg["#ddaf3c"],
  },
  {
    char: "y",
    fgColor: ColorMaps.fg["#4ebf22"],
    bgColor: ColorMaps.bg.black,
  },
  {
    char: "r",
    fgColor: ColorMaps.fg["#d9d9d9"],
    bgColor: ColorMaps.bg.black,
  },
  {
    char: "e",
    fgColor: ColorMaps.fg["#4ebf22"],
    bgColor: ColorMaps.bg.black,
  },
  {
    char: "c",
    fgColor: ColorMaps.fg["#26b0d7"],
    bgColor: ColorMaps.bg.black,
  },
  {
    char: " ",
  },
  {
    char: "P",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg.transparent,
  },
  {
    char: "l",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg.transparent,
  },
  {
    char: "a",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg.transparent,
  },
  {
    char: "y",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg.transparent,
  },
  {
    char: "e",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg.transparent,
  },
  {
    char: "r",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg.transparent,
  },
];

const App = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [tab, setTab] = useState<"playlist" | "search">("playlist");
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [safeFile, setSafeFile] = useState<File | Blob | null>(null);
  const {
    result,
    status,
    decompressFile,
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

    // // 파일 버퍼도 업데이트
    // const updatedBuffers = [...fileBuffers];
    // if (updatedBuffers.length > indexToRemove) {
    //   updatedBuffers.splice(indexToRemove, 1);
    //   setFileBuffers(updatedBuffers);
    // }
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

    const fileBuffers = await Promise.all(
      selectedMergeFiles.map(async (file) => {
        return await loadFileBuffer(file);
      })
    );

    try {
      // 파일 병합
      const mergedBuffer = mergeTtyrecFiles(fileBuffers);

      // 병합된 파일 생성
      const mergedBlob = new Blob([mergedBuffer], {
        type: "application/octet-stream",
      });
      const mergedFile = new File([mergedBlob], "merged_ttyrec.ttyrec", {
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

  return (
    <div className="relative mx-auto xl:py-8 py-4">
      {cacheStats && (
        <div className="text-xs text-gray-500 mb-2 text-right">
          압축 해제 캐시: {formatSize(cacheStats.currentSize)} /{" "}
          {formatSize(cacheStats.maxSize)}
        </div>
      )}
      <div className="mx-auto relative w-auto inline-flex items-center mb-4">
        <h1 className="xl:text-2xl text-lg font-bold text-center">
          <DrawDCSSCharacters chars={logoChars} />
          <DrawDCSSCharacters chars={titleChars} />
        </h1>
        {selectedFiles.length > 0 && (
          <div className="absolute -right-[150px] flex gap-2">
            <Button size="sm" onClick={handleReset} className="cursor-pointer">
              <RotateCcw className="w-4 h-4" /> 초기화
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
                  selectedMergeFiles={selectedMergeFiles}
                  onMergeFileSelect={(index) => handleMergeFileSelect(index)}
                />
                {isMergeMode && (
                  <Button
                    disabled={selectedMergeFiles.length < 2}
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
      {selectedFiles.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg mx-auto hidden sm:block lg:max-w-[500px] xl:max-w-[896px]">
          <h3 className="font-semibold mb-3">키보드 단축키</h3>
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

      {/* Footer with GitHub link */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-400 lg:right-[calc((100vw-500px)/2)] xl:right-[calc((100vw-896px)/2)]">
        <a
          href="https://github.com/caiman-dorohedoro/dcss-ttyrec-player"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center hover:text-gray-500 transition-colors"
        >
          <span>GitHub</span>
        </a>
      </div>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:cursor-pointer">
              확인
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default App;
