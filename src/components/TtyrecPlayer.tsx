import { useRef, useEffect } from "react";
import * as AsciinemaPlayer from "asciinema-player";
import "asciinema-player/dist/bundle/asciinema-player.css";
import useBz2DecompressWorker from "@/hooks/useBz2DecompressWorker";

const TtyrecPlayer = ({
  file,
  onEnded,
}: {
  file: File;
  onEnded: () => void;
}) => {
  const { result, decompressFile } = useBz2DecompressWorker();
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
    if (result) {
      const url = URL.createObjectURL(result);

      playerRef.current = AsciinemaPlayer.create(
        {
          url,
          parser: "ttyrec",
        },
        containerRef.current
      );

      playerRef.current.addEventListener("ended", onEnded);
    }
  }, [result, onEnded]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div ref={containerRef} className="bg-black rounded-lg overflow-hidden" />
    </div>
  );
};

export default TtyrecPlayer;
