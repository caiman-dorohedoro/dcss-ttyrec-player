import { TtyrecSearchResult } from "@/lib/search";

export enum States {
  INIT = "INIT",
  SEARCHING = "SEARCHING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

export type State = (typeof States)[keyof typeof States];

export enum MessageType {
  STATUS = "status",
  SEARCH = "search",
  DATA = "data",
  ERROR = "error",
}

export type StatusMessage = {
  type: MessageType.STATUS;
  status: State;
};

export type SearchMessage = {
  type: MessageType.SEARCH;
  searchText: string;
  data: ArrayBuffer;
};

export type SearchResultMessage = {
  type: MessageType.DATA;
  data: TtyrecSearchResult[];
};

export type ErrorMessage = {
  type: MessageType.ERROR;
  error: string;
};

export type Message =
  | SearchMessage
  | SearchResultMessage
  | ErrorMessage
  | StatusMessage;
