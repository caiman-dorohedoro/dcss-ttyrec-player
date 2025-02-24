import {
  CacheStats,
  Message,
  MessageType,
  State,
  States,
} from "@/types/decompressWorker";
import { useState, useCallback, useEffect } from "react";
import DecompressWorker from "@/workers/decompressWorker?worker";

const postMessage = (worker: Worker, message: Message) => {
  worker.postMessage(message);
};

const useBz2DecompressWorker = () => {
  const [status, setStatus] = useState<State>(States.INIT);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const w = new DecompressWorker();

    w.onmessage = (e: MessageEvent<Message>) => {
      if (e.data.type === MessageType.STATUS) {
        setStatus(e.data.status);

        return;
      }

      if (e.data.type === MessageType.DATA) {
        setResult(e.data.data || null);

        return;
      }

      if (e.data.type === MessageType.ERROR) {
        setStatus(States.ERROR);
        setError(e.data.error || null);

        return;
      }

      if (e.data.type === MessageType.CACHE_STATS) {
        setCacheStats(e.data.stats);
        return;
      }
    };

    setWorker(w);

    // 초기 캐시 상태 요청
    w.postMessage({ type: MessageType.CACHE_STATS });

    // cleanup
    return () => w.terminate();
  }, []);

  const decompressFile = useCallback(
    async (file: File) => {
      if (!worker) return;

      try {
        setError(null);

        postMessage(worker, {
          type: MessageType.DECOMPRESS,
          name: file.name,
          data: file,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [worker]
  );

  const clearCache = useCallback(() => {
    if (!worker) return;

    postMessage(worker, { type: MessageType.CLEAR_CACHE });
  }, [worker]);

  return {
    status,
    result,
    error,
    cacheStats,
    decompressFile,
    clearCache,
  };
};

export default useBz2DecompressWorker;
