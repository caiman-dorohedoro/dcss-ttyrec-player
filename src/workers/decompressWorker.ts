import { LRUCache } from "lru-cache";
import decompress from "../lib/bz2";
import { State, States, Message, MessageType } from "../types/decompressWorker";

const cache = new LRUCache({
  max: 50, // 최대 50개 항목
  maxSize: 400 * 1024 * 1024, // 최대 100MB
  sizeCalculation: (value: Blob) => {
    return value.size; // Blob의 크기를 기준으로
  },
  ttl: 1000 * 60 * 30,
});

const postMessage = (message: Message) => {
  self.postMessage(message);
};

const updateState = (state: State) => {
  postMessage({
    type: MessageType.STATUS,
    status: state,
  });
};

self.onmessage = async (e: MessageEvent<Message>) => {
  try {
    if (e.data.type === "decompress") {
      if (e.data.data === undefined) {
        throw new Error("No data provided");
      }

      const fileName = e.data.name || "default";

      // 캐시에서 확인
      const cachedData = cache.get(fileName);

      if (cachedData) {
        postMessage({
          type: MessageType.DATA,
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
      cache.set(fileName, blob);

      postMessage({
        type: MessageType.DATA,
        data: blob,
      });

      updateState(States.COMPLETED);
    }
  } catch (error) {
    updateState(States.ERROR);
    postMessage({
      type: MessageType.ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
