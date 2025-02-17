import { RefObject, useState } from "react";
import useSearchWorker from "@/hooks/useSearchWorker";
import { States } from "@/types/decompressWorker";
import { States as SearchStates } from "@/types/searchWorker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SearchProps = {
  playerRef: RefObject<{ seek: (timestamp: number) => void }>;
  file: Blob | File | null;
};

const Search = ({ playerRef, file }: SearchProps) => {
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
    await search(buffer, searchText);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex gap-4 p-2">
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchText}
            disabled={
              status === States.DECOMPRESSING ||
              searchStatus === SearchStates.SEARCHING
            }
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button className="hover:cursor-pointer" onClick={handleSearchClick}>
            검색
          </Button>
        </div>
      </div>
      {searchResult && searchResult.length > 0 && (
        <div className="flex flex-col gap-2 text-start">
          {searchResult.map((result) => (
            <div
              className="flex gap-2 border hover:bg-gray-100"
              key={result.frame}
              onClick={() => {
                handleTimestampClick(result.relativeTimestamp.time);
              }}
            >
              <div>{result.relativeTimestamp.time}</div>
              <div>{result.textSnippet}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
