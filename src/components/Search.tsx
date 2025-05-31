import { RefObject, useState } from "react";
import useSearchWorker from "@/hooks/useSearchWorker";
import { States } from "@/types/decompressWorker";
import { States as SearchStates } from "@/types/searchWorker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Dialog from "@/components/Dialog";

type SearchProps = {
  playerRef: RefObject<{ seek: (timestamp: number) => void }>;
  file: Blob | File | null;
  decompressStatus: States;
  isRegexMode: boolean;
};

const timeFormatter = (time: number) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${minutes}:${seconds}`;
  }

  return `${minutes}:${seconds}`;
};

const Search = ({
  playerRef,
  file,
  decompressStatus,
  isRegexMode,
}: SearchProps) => {
  const {
    status: searchStatus,
    result: searchResult,
    search,
    error,
  } = useSearchWorker();
  const [searchText, setSearchText] = useState("");
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingSearch, setPendingSearch] = useState(false);

  const handleTimestampClick = (timestamp: number) => {
    if (playerRef.current) {
      playerRef.current.seek(timestamp);
    }
  };

  const isSearchTextValid = (text: string): boolean => {
    // Allow empty search since there's a default search term "ready to make a new sacrifice"
    if (!text) return true;

    const trimmedText = text.trim();

    return trimmedText.length > 2;
  };

  const handleSearchClick = async (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (file === null) return;

    if (!isSearchTextValid(searchText)) {
      setShowWarningDialog(true);
      setPendingSearch(true);
      e.preventDefault();
      return;
    }

    executeSearch();
  };

  const executeSearch = async () => {
    if (file === null) return;

    const buffer = await file.arrayBuffer();
    await search(
      buffer,
      searchText || "ready to make a new sacrifice",
      isRegexMode
    );
    setPendingSearch(false);
  };

  const placeholder =
    decompressStatus === States.DECOMPRESSING
      ? "압축 해제중..."
      : "ready to make a new sacrifice";

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex gap-2 mb-2">
        <Input
          type="text"
          value={searchText}
          disabled={
            decompressStatus === States.DECOMPRESSING ||
            searchStatus === SearchStates.SEARCHING
          }
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchClick(e);
            }
          }}
          placeholder={placeholder}
        />
        <Button
          variant="default"
          className="hover:cursor-pointer"
          onClick={handleSearchClick}
          disabled={
            decompressStatus === States.DECOMPRESSING ||
            searchStatus === SearchStates.SEARCHING
          }
        >
          검색
        </Button>
      </div>

      <Dialog
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        title="검색어 확인"
        description="검색어가 비어있거나 너무 짧아 검색에 오래 걸릴 수 있습니다 (3글자
              이상 권장). 계속 진행하시겠습니까?"
        onCancel={() => {
          setPendingSearch(false);
          setShowWarningDialog(false);
        }}
        onConfirm={() => {
          setShowWarningDialog(false);

          if (pendingSearch) {
            executeSearch();
          }
        }}
        confirmText="검색"
        cancelText="취소"
      />
      {searchStatus === SearchStates.SEARCHING && (
        <Card className="p-4 rounded-sm flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm text-muted-foreground">검색 중...</p>
        </Card>
      )}
      {searchStatus === SearchStates.COMPLETED &&
        searchResult &&
        searchResult.length === 0 && (
          <Card className="p-4 rounded-sm flex items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </p>
          </Card>
        )}
      {searchStatus === SearchStates.COMPLETED &&
        searchResult &&
        searchResult.length > 0 && (
          <div className="relative">
            <div className="flex flex-col gap-2 max-h-[546px] overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent pb-4">
              {searchResult.map((result) => (
                <Card
                  key={result.frame}
                  className="p-2 rounded-sm hover:bg-accent transition-colors cursor-pointer break-all"
                  onClick={() =>
                    handleTimestampClick(result.relativeTimestamp.time)
                  }
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-left text-muted-foreground min-w-[50px]">
                      {timeFormatter(result.relativeTimestamp.time)}
                    </span>
                    <p className="text-sm text-left leading-relaxed">
                      {result.textSnippet}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        )}
      {searchStatus === SearchStates.ERROR && (
        <Card className="p-4 rounded-sm flex gap-2">
          <p className="text-sm text-red-500">
            검색 중 오류가 발생했습니다.
            <br />
            <pre className="text-xs mt-1 text-muted-foreground whitespace-pre-wrap text-start">
              {error}
            </pre>
          </p>
        </Card>
      )}
    </div>
  );
};

export default Search;
