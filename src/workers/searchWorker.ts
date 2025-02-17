import search from "../lib/search";
import { State, States, Message, MessageType } from "../types/searchWorker";

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
    if (e.data.type === MessageType.SEARCH) {
      const results = search(e.data.data, e.data.searchText);

      // 결과 전송
      postMessage({
        type: MessageType.DATA,
        data: results,
      });

      // 상태 업데이트: 완료
      updateState(States.COMPLETED);
    }
  } catch (error) {
    // 상태 업데이트: 에러
    updateState(States.ERROR);

    postMessage({
      type: MessageType.ERROR,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
