import { useRef, useEffect, useState } from "react";
import * as AsciinemaPlayer from "asciinema-player";
import "asciinema-player/dist/bundle/asciinema-player.css";
import decompress from "@/lib/bz2";

interface TtyrecPlayerProps {
  file: File;
  onEnded: () => void;
  initialPosition?: number;
  onPositionUpdate?: (position: number) => void;
}

const TtyrecPlayer = ({
  file,
  onEnded,
  initialPosition = 0,
}: TtyrecPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initPlayer = async () => {
      if (!file || !containerRef.current) return;

      // 기존 플레이어 정리
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }

      try {
        const isCompressed = file.name.endsWith(".bz2");
        let url: string;

        if (isCompressed) {
          const fileData = await file.arrayBuffer();
          const decompressed = decompress(new Uint8Array(fileData));
          const blob = new Blob([decompressed], {
            type: "application/octet-stream",
          });
          url = URL.createObjectURL(blob);
        } else {
          url = URL.createObjectURL(file);
        }

        if (!containerRef.current) return;

        playerRef.current = AsciinemaPlayer.create(
          {
            url,
            parser: "ttyrec",
            startAt: initialPosition,
          },
          containerRef.current
        );

        playerRef.current.addEventListener("ended", onEnded);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("Error initializing player:", error);
        setError("Failed to load the player. Please try again.");
      }
    };

    initPlayer();

    // cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [file, onEnded, initialPosition]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div ref={containerRef} className="bg-black rounded-lg overflow-hidden" />
    </div>
  );
};

export default TtyrecPlayer;
