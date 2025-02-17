import { RefObject, useState } from "react";
import useSearchWorker from "@/hooks/useSearchWorker";
import { States } from "@/types/decompressWorker";
import { States as SearchStates } from "@/types/searchWorker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type SearchProps = {
  playerRef: RefObject<{ seek: (timestamp: number) => void }>;
  file: Blob | File | null;
  decompressStatus: States;
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

const Search = ({ playerRef, file, decompressStatus }: SearchProps) => {
  const {
    status: searchStatus,
    result: searchResult,
    search,
  } = useSearchWorker();
  const [searchText, setSearchText] = useState("");

  const handleTimestampClick = (timestamp: number) => {
    if (playerRef.current) {
      playerRef.current.seek(timestamp);
    }
  };

  const handleSearchClick = async () => {
    if (file === null) return;
    const buffer = await file.arrayBuffer();
    await search(buffer, searchText || "ready to make a new sacrifice");
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
              handleSearchClick();
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
          <div className="flex flex-col gap-2">
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
        )}
    </div>
  );
};

export default Search;
