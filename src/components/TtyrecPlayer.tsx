import { useRef, useEffect, useState } from "react";
import * as AsciinemaPlayer from "asciinema-player";
import "asciinema-player/dist/bundle/asciinema-player.css";
import useBz2DecompressWorker from "@/hooks/useBz2DecompressWorker";
import { States } from "@/types/decompressWorker";
import useSearchWorker from "@/hooks/useSearchWorker";
import { States as SearchStates } from "@/types/searchWorker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TtyrecPlayer = ({
  file,
  onEnded,
}: {
  file: File;
  onEnded: () => void;
}) => {
  const { result, status, decompressFile } = useBz2DecompressWorker();
  const {
    status: searchStatus,
    result: searchResult,
    search,
  } = useSearchWorker();
  const containerRef = useRef<HTMLDivElement>(null);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const playerRef = useRef<any>(null);
  const [searchText, setSearchText] = useState("");

  const handleTimestampClick = (timestamp: number) => {
    if (playerRef.current) {
      playerRef.current.seek(timestamp);
    }
  };

  const handleSearchClick = async () => {
    const isCompressed = file.name.endsWith(".bz2");

    if (isCompressed && result === null) {
      return;
    }

    if (isCompressed && result) {
      const buffer = await result?.arrayBuffer();
      await search(buffer, searchText);
    } else {
      const buffer = await file.arrayBuffer();
      await search(buffer, searchText);
    }
  };

  useEffect(() => {
    const initPlayer = async () => {
      if (!file || !containerRef.current) return;

      // 기존 player 정리
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }

      const isCompressed = file.name.endsWith(".bz2");

      if (!isCompressed) {
        try {
          const url = URL.createObjectURL(file);

          playerRef.current = AsciinemaPlayer.create(
            {
              url,
              parser: "ttyrec",
            },
            containerRef.current
          );

          playerRef.current.addEventListener("ended", onEnded);
        } catch (error) {
          console.error("Error decompressing file:", error);
        }

        return;
      }

      if (isCompressed) {
        try {
          decompressFile(file);
        } catch (error) {
          console.error("Error decompressing file:", error);
        }
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [file, onEnded, decompressFile]);

  useEffect(() => {
    if (!result) return;

    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    const url = URL.createObjectURL(result);

    playerRef.current = AsciinemaPlayer.create(
      {
        url,
        parser: "ttyrec",
      },
      containerRef.current
    );

    playerRef.current.addEventListener("ended", onEnded);

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [result, onEnded]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {status === States.DECOMPRESSING && (
        <div className="bg-gray-100 max-w-[896px] mx-auto rounded-lg p-4">
          {/* <p>Decompressing...</p> */}
          <p>압축 해제중...</p>
        </div>
      )}
      {status !== States.DECOMPRESSING && (
        <div
          ref={containerRef}
          className="bg-black rounded-lg overflow-hidden"
        />
      )}
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

export default TtyrecPlayer;
