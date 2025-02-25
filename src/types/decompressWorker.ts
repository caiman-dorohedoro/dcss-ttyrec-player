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

export enum WorkerOutgoingMessageType {
  STATUS = "status",
  DATA = "data",
  ERROR = "error",
  CACHE_STATS_RESULT = "cache_stats_result",
}

export enum WorkerIncomingMessageType {
  DECOMPRESS = "decompress",
  CACHE_STATS = "cache_stats",
  CLEAR_CACHE = "clear_cache",
}

export type DecompressMessage = {
  type: WorkerIncomingMessageType.DECOMPRESS;
  name: string;
  data: File;
};

export type DecompressResultMessage = {
  type: WorkerOutgoingMessageType.DATA;
  data: Blob;
};

export type StatusMessage = {
  type: WorkerOutgoingMessageType.STATUS;
  status: State;
};

export type CacheStatsMessage = {
  type: WorkerIncomingMessageType.CACHE_STATS;
  stats: CacheStats;
};

export type CacheStatsResultMessage = {
  type: WorkerOutgoingMessageType.CACHE_STATS_RESULT;
  stats: CacheStats;
};

export type ClearCacheMessage = {
  type: WorkerIncomingMessageType.CLEAR_CACHE;
};

export type ErrorMessage = {
  type: WorkerOutgoingMessageType.ERROR;
  error: string;
};

export type WorkerOutgoingMessage =
  | DecompressResultMessage
  | StatusMessage
  | ErrorMessage
  | CacheStatsResultMessage;

export type WorkerIncomingMessage =
  | DecompressMessage
  | CacheStatsMessage
  | ClearCacheMessage;
