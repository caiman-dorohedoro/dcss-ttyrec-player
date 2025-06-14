import { Message, MessageType, State, States } from "@/types/searchWorker";
import { useState, useCallback, useEffect } from "react";
import SearchWorker from "@/workers/searchWorker?worker";
import { TtyrecSearchResult } from "@/lib/search";

// Merge results if relativeTimestamp.time difference is less than 1 second
const simplifySearchResult = (result: TtyrecSearchResult[]) => {
  if (result.length === 0) return [];

  const simplified = [];
  let current = result[0];
  for (let i = 1; i < result.length; i++) {
    if (result[i].relativeTimestamp.time - current.relativeTimestamp.time < 1) {
      continue;
    } else {
      simplified.push(current);
      current = result[i];
    }
  }
  simplified.push(current);
  return simplified;
};

const postMessage = (worker: Worker, message: Message) => {
  worker.postMessage(message);
};

const useBz2DecompressWorker = () => {
  const [status, setStatus] = useState<State>(States.INIT);
  const [result, setResult] = useState<TtyrecSearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const w = new SearchWorker();

    w.onmessage = (e: MessageEvent<Message>) => {
      if (e.data.type === MessageType.STATUS) {
        setStatus(e.data.status);

        return;
      }

      if (e.data.type === MessageType.DATA) {
        setResult(simplifySearchResult(e.data.data || []));
        setStatus(States.COMPLETED);
        return;
      }

      if (e.data.type === MessageType.ERROR) {
        setStatus(States.ERROR);
        setError(e.data.error || null);

        return;
      }
    };

    setWorker(w);

    // cleanup
    return () => w.terminate();
  }, []);

  const search = useCallback(
    async (data: ArrayBuffer, searchText: string, isRegexMode: boolean) => {
      if (!worker) return;

      try {
        setError(null);
        setStatus(States.SEARCHING);

        postMessage(worker, {
          type: MessageType.SEARCH,
          data,
          searchText,
          isRegexMode,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [worker]
  );

  return {
    status,
    result,
    error,
    search,
  };
};

export default useBz2DecompressWorker;
