import { LRUCache } from "lru-cache";
import decompress from "../lib/bz2";
import {
  State,
  States,
  WorkerOutgoingMessageType,
  WorkerIncomingMessage,
  WorkerIncomingMessageType,
  CacheStats,
  WorkerOutgoingMessage,
  DecompressMessage,
  isDecompressMessage,
  isDecompressBatchMessage,
  DecompressBatchMessage,
} from "../types/decompressWorker";

const postMessage = (message: WorkerOutgoingMessage) => {
  self.postMessage(message);
};

const cache = new LRUCache({
  max: 50,
  maxSize: 400 * 1024 * 1024,
  sizeCalculation: (value: Blob) => {
    return value.size;
  },
  ttl: 1000 * 60 * 30,
  dispose: (_: Blob, key: string) => {
    // Update state when cache item is removed
    sendCacheStats();
    sendCacheDisposedFileName(key);
  },
});

const sendCacheStats = () => {
  const cacheStats: CacheStats = {
    size: cache.size,
    maxSize: cache.maxSize,
    currentSize: cache.calculatedSize || 0,
  };

  postMessage({
    type: WorkerOutgoingMessageType.CACHE_STATS_RESULT,
    stats: cacheStats,
  });
};

const sendCacheDisposedFileName = (fileName: string) => {
  postMessage({
    type: WorkerOutgoingMessageType.CACHE_DISPOSED_FILENAME,
    fileName,
  });
};

const sendCachedFileName = (fileName: string) => {
  postMessage({
    type: WorkerOutgoingMessageType.CACHED_FILENAME,
    fileName,
  });
};

const updateState = (state: State) => {
  postMessage({
    type: WorkerOutgoingMessageType.STATUS,
    status: state,
  });
};

// Wrap cache manipulation functions to track state changes
const setCacheItem = (key: string, value: Blob) => {
  cache.set(key, value);

  // Send cache stats after setting cache item
  sendCacheStats();

  if (cache.get(key)) {
    sendCachedFileName(key);
  }
};

const sendCachedData = (cachedData: Blob) => {
  postMessage({
    type: WorkerOutgoingMessageType.DECOMPRESS_RESULT,
    data: cachedData,
  });
  updateState(States.COMPLETED);
};

const decompressFile = async (file: File) => {
  const fileData = await file.arrayBuffer();
  const decompressed = decompress(new Uint8Array(fileData));
  const blob = new Blob([decompressed], {
    type: "application/octet-stream",
  });

  return blob;
};

const handleIncomingDecompressRequest = async (
  e: MessageEvent<DecompressMessage>
) => {
  if (e.data.data === undefined) {
    throw new Error("No data provided");
  }

  const fileName = e.data.name;

  const cachedData = cache.get(fileName);

  if (cachedData) {
    sendCachedData(cachedData);
    return;
  }

  updateState(States.DECOMPRESSING);

  const blob = await decompressFile(e.data.data);

  // Store in LRU cache
  setCacheItem(fileName, blob);

  postMessage({
    type: WorkerOutgoingMessageType.DECOMPRESS_RESULT,
    data: blob,
  });

  updateState(States.COMPLETED);
};

// Handle multiple file decompression
const handleIncomingDecompressBatchRequest = async (
  e: MessageEvent<DecompressBatchMessage>
) => {
  if (!e.data.files || e.data.files.length === 0) {
    throw new Error("No files provided");
  }

  updateState(States.DECOMPRESSING);

  const results: Blob[] = [];

  for (const file of e.data.files) {
    const cachedData = cache.get(file.name);

    if (cachedData) {
      results.push(cachedData);
    } else {
      const blob = await decompressFile(file);

      // Store in LRU cache
      setCacheItem(file.name, blob);

      results.push(blob);
    }
  }

  postMessage({
    type: WorkerOutgoingMessageType.DECOMPRESS_RESULT,
    batchData: results,
    originalFiles: e.data.files,
  });

  updateState(States.COMPLETED);
};

self.onmessage = async (e: MessageEvent<WorkerIncomingMessage>) => {
  try {
    if (isDecompressMessage(e)) {
      handleIncomingDecompressRequest(e);
    } else if (isDecompressBatchMessage(e)) {
      handleIncomingDecompressBatchRequest(e);
    } else if (e.data.type === WorkerIncomingMessageType.CACHE_STATS) {
      sendCacheStats();
    } else if (e.data.type === WorkerIncomingMessageType.CLEAR_CACHE) {
      cache.clear();
      sendCacheStats();
    }
  } catch (error) {
    updateState(States.ERROR);
    postMessage({
      type: WorkerOutgoingMessageType.ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
