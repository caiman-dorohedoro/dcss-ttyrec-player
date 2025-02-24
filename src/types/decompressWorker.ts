export enum States {
  INIT = "INIT",
  DECOMPRESSING = "DECOMPRESSING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

export type State = (typeof States)[keyof typeof States];

export type CacheStats = {
  size: number;
  maxSize: number;
  currentSize: number;
};

export enum MessageType {
  DECOMPRESS = "decompress",
  STATUS = "status",
  DATA = "data",
  ERROR = "error",
  CACHE_STATS = "cache_stats",
  CLEAR_CACHE = "clear_cache",
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

export type CacheStatsMessage = {
  type: MessageType.CACHE_STATS;
  stats: CacheStats;
};

export type ClearCacheMessage = {
  type: MessageType.CLEAR_CACHE;
};

export type ErrorMessage = {
  type: MessageType.ERROR;
  error: string;
};

export type Message =
  | DecompressMessage
  | StatusMessage
  | ErrorMessage
  | DecompressResultMessage
  | CacheStatsMessage
  | ClearCacheMessage;
