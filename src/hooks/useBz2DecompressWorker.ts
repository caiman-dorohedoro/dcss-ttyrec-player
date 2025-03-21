import {
  CacheStats,
  WorkerOutgoingMessage,
  WorkerOutgoingMessageType,
  State,
  States,
  WorkerIncomingMessageType,
  WorkerIncomingMessage,
} from "@/types/decompressWorker";
import { useState, useCallback, useEffect } from "react";
import DecompressWorker from "@/workers/decompressWorker?worker";

const postMessage = (worker: Worker, message: WorkerIncomingMessage) => {
  worker.postMessage(message);
};

const useBz2DecompressWorker = () => {
  const [status, setStatus] = useState<State>(States.INIT);
  const [result, setResult] = useState<Blob | null>(null);
  const [batchResults, setBatchResults] = useState<{
    blobs: Blob[];
    originalFiles: File[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [cachedFileNames, setCachedFileNames] = useState<string[]>([]);

  useEffect(() => {
    const w = new DecompressWorker();

    w.onmessage = (e: MessageEvent<WorkerOutgoingMessage>) => {
      if (e.data.type === WorkerOutgoingMessageType.STATUS) {
        setStatus(e.data.status);

        return;
      }

      if (e.data.type === WorkerOutgoingMessageType.DECOMPRESS_RESULT) {
        // 단일 파일 압축 해제 결과
        if ("data" in e.data) {
          setResult(e.data.data || null);
        }
        // 배치 파일 압축 해제 결과
        else if ("batchData" in e.data && "originalFiles" in e.data) {
          setBatchResults({
            blobs: e.data.batchData,
            originalFiles: e.data.originalFiles,
          });
        }

        return;
      }

      if (e.data.type === WorkerOutgoingMessageType.ERROR) {
        setStatus(States.ERROR);
        setError(e.data.error || null);

        return;
      }

      if (e.data.type === WorkerOutgoingMessageType.CACHE_STATS_RESULT) {
        setCacheStats(e.data.stats);
        return;
      }

      if (e.data.type === WorkerOutgoingMessageType.CACHED_FILENAME) {
        setCachedFileNames((prev) => {
          if (e.data.type !== WorkerOutgoingMessageType.CACHED_FILENAME) {
            return prev;
          }

          return [...prev, e.data.fileName];
        });
        return;
      }

      if (e.data.type === WorkerOutgoingMessageType.CACHE_DISPOSED_FILENAME) {
        setCachedFileNames((prev) =>
          prev.filter((fileName) => {
            if (
              e.data.type !== WorkerOutgoingMessageType.CACHE_DISPOSED_FILENAME
            ) {
              return true;
            }

            return fileName !== e.data.fileName;
          })
        );
        return;
      }
    };

    setWorker(w);

    // 초기 캐시 상태 요청
    w.postMessage({ type: WorkerOutgoingMessageType.CACHE_STATS_RESULT });

    // cleanup
    return () => w.terminate();
  }, []);

  const decompressFile = useCallback(
    async (file: File) => {
      if (!worker) return;

      try {
        setError(null);

        postMessage(worker, {
          type: WorkerIncomingMessageType.DECOMPRESS,
          name: file.name,
          data: file,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [worker]
  );

  // 새로운 함수: 여러 파일 동시에 압축 해제
  const decompressBatch = useCallback(
    async (files: File[]) => {
      if (!worker) return;

      try {
        setError(null);
        setBatchResults(null);

        postMessage(worker, {
          type: WorkerIncomingMessageType.DECOMPRESS_BATCH,
          files,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [worker]
  );

  const clearCache = useCallback(() => {
    if (!worker) return;

    postMessage(worker, { type: WorkerIncomingMessageType.CLEAR_CACHE });
  }, [worker]);

  return {
    status,
    result,
    batchResults,
    error,
    cacheStats,
    decompressFile,
    decompressBatch, // 새로운 함수 export
    clearCache,
    cachedFileNames,
  };
};

export default useBz2DecompressWorker;
