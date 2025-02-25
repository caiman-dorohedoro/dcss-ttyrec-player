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
} from "../types/decompressWorker";

const postMessage = (message: WorkerOutgoingMessage) => {
  self.postMessage(message);
};

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

const cache = new LRUCache({
  max: 50, // 최대 50개 항목
  maxSize: 400 * 1024 * 1024, // 최대 100MB
  sizeCalculation: (value: Blob) => {
    return value.size; // Blob의 크기를 기준으로
  },
  ttl: 1000 * 60 * 30,
  dispose: () => {
    // 캐시 항목이 제거될 때 상태 업데이트
    sendCacheStats();
  },
});

const updateState = (state: State) => {
  postMessage({
    type: WorkerOutgoingMessageType.STATUS,
    status: state,
  });
};

// 캐시 조작하는 함수들을 래핑하여 상태 변경 추적
const setCacheItem = (key: string, value: Blob) => {
  cache.set(key, value);
  sendCacheStats(); // 캐시 설정 후 상태 전송
};

self.onmessage = async (e: MessageEvent<WorkerIncomingMessage>) => {
  try {
    if (e.data.type === WorkerIncomingMessageType.DECOMPRESS) {
      if (e.data.data === undefined) {
        throw new Error("No data provided");
      }

      const fileName = e.data.name || "default";

      // 캐시에서 확인
      const cachedData = cache.get(fileName);

      if (cachedData) {
        postMessage({
          type: WorkerOutgoingMessageType.DATA,
          data: cachedData,
        });
        updateState(States.COMPLETED);
        return;
      }

      updateState(States.DECOMPRESSING);

      const fileData = await e.data.data.arrayBuffer();
      const decompressed = decompress(new Uint8Array(fileData));
      const blob = new Blob([decompressed], {
        type: "application/octet-stream",
      });

      // LRU 캐시에 저장
      setCacheItem(fileName, blob);

      postMessage({
        type: WorkerOutgoingMessageType.DATA,
        data: blob,
      });

      updateState(States.COMPLETED);
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
