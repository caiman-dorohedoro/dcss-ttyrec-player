import { useRef, useEffect } from "react";
import { decompress } from 'bz2';
import * as AsciinemaPlayer from 'asciinema-player';
import 'asciinema-player/dist/bundle/asciinema-player.css';

const TtyrecPlayer = ({ file }: { file: File }) => {
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
        const isCompressed = file.name.endsWith('.bz2');
        let url: string;
        
        if (isCompressed) {
          const fileData = await file.arrayBuffer();
          const decompressed = decompress(new Uint8Array(fileData));
          const blob = new Blob([decompressed], { type: 'application/octet-stream' });
          url = URL.createObjectURL(blob);
        } else {
          url = URL.createObjectURL(file);
        }
        
        playerRef.current = AsciinemaPlayer.create({
          url: url,
          parser: 'ttyrec'
        }, containerRef.current);
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [file]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div ref={containerRef} className="bg-black rounded-lg overflow-hidden" />
    </div>
  );
};

export default TtyrecPlayer;
