export enum States {
  INIT = "INIT",
  DECOMPRESSING = "DECOMPRESSING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

export type State = (typeof States)[keyof typeof States];

export type MessageType = "decompress" | "status" | "data" | "error";

export type Message = {
  type: MessageType;
  status?: State;
  data?: Blob;
  error?: string;
};
