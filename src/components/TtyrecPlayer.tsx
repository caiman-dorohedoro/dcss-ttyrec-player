import { useRef, useEffect } from "react";
import * as AsciinemaPlayer from "asciinema-player";
import "asciinema-player/dist/bundle/asciinema-player.css";
import { States } from "@/types/decompressWorker";

const TtyrecPlayer = ({
  file,
  status,
  onEnded,
}: {
  file: File | Blob | null;
  status: States;
  onEnded: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const initPlayer = async () => {
      if (!file || !containerRef.current) return;

      // 기존 player 정리
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }

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
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [file, onEnded]);

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
    </div>
  );
};

export default TtyrecPlayer;
