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
      const results = search(
        e.data.data,
        e.data.searchText,
        e.data.isRegexMode
      );

      postMessage({
        type: MessageType.DATA,
        data: results,
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
