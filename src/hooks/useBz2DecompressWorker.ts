import { Message, State, States } from "@/types/decompressWorker";
import { useState, useCallback, useEffect } from "react";
import DecompressWorker from "@/workers/decompressWorker?worker";

const postMessage = (worker: Worker, message: Message) => {
  worker.postMessage(message);
};

const useBz2DecompressWorker = () => {
  const [status, setStatus] = useState<State>(States.INIT);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const w = new DecompressWorker();

    w.onmessage = (e) => {
      const { type, status, data, error } = e.data as Message;

      if (type === "status") {
        setStatus(status as State);
      } else if (type === "data") {
        setResult(data || null);
      } else if (type === "error") {
        setStatus(States.ERROR);
        setError(error || null);
      }
    };

    setWorker(w);

    // cleanup
    return () => w.terminate();
  }, []);

  const decompressFile = useCallback(
    async (file: File) => {
      if (!worker) return;

      try {
        setError(null);

        postMessage(worker, {
          type: "decompress",
          data: file,
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
    decompressFile,
  };
};

export default useBz2DecompressWorker;
