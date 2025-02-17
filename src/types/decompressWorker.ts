export enum States {
  INIT = "INIT",
  DECOMPRESSING = "DECOMPRESSING",
  COMPLETED = "COMPLETED",
  SEARCHING = "SEARCHING",
  ERROR = "ERROR",
}

export type State = (typeof States)[keyof typeof States];

export enum MessageType {
  DECOMPRESS = "decompress",
  STATUS = "status",
  DATA = "data",
  ERROR = "error",
}

export type DecompressMessage = {
  type: MessageType.DECOMPRESS;
  name: string;
  data: File;
};

export type DecompressResultMessage = {
  type: MessageType.DATA;
  data: Blob;
};

export type StatusMessage = {
  type: MessageType.STATUS;
  status: State;
};

export type ErrorMessage = {
  type: MessageType.ERROR;
  error: string;
};

export type Message =
  | DecompressMessage
  | StatusMessage
  | ErrorMessage
  | DecompressResultMessage;
