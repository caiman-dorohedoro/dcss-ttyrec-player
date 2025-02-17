import decompress from "../lib/bz2";
import { State, States, Message } from "../types/decompressWorker";

const postMessage = (message: Message) => {
  self.postMessage(message);
};

const updateState = (state: State) => {
  postMessage({
    type: "status",
    status: state,
  });
};

self.onmessage = async (e: MessageEvent<Message>) => {
  try {
    if (e.data.type === "decompress") {
      if (e.data.data === undefined) {
        throw new Error("No data provided");
      }

      // 상태 업데이트: 압축 해제 시작
      updateState(States.DECOMPRESSING);

      const fileData = await e.data.data.arrayBuffer();
      const decompressed = decompress(new Uint8Array(fileData));
      const blob = new Blob([decompressed], {
        type: "application/octet-stream",
      });

      // 결과 전송
      postMessage({
        type: "data",
        data: blob,
      });

      // 상태 업데이트: 완료
      updateState(States.COMPLETED);
    }
  } catch (error) {
    // 상태 업데이트: 에러
    updateState(States.ERROR);

    postMessage({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
