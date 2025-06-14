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
  DECOMPRESS_RESULT = "decompress_result",
  ERROR = "error",
  CACHE_STATS_RESULT = "cache_stats_result",
  CACHED_FILENAME = "cached_filename",
  CACHE_DISPOSED_FILENAME = "cache_disposed_filename",
}

export enum WorkerIncomingMessageType {
  DECOMPRESS = "decompress",
  CACHE_STATS = "cache_stats",
  CLEAR_CACHE = "clear_cache",
  DECOMPRESS_BATCH = "decompress_batch",
}

export type DecompressMessage = {
  type: WorkerIncomingMessageType.DECOMPRESS;
  name: string;
  data: File;
};

export type DecompressResultMessage = {
  type: WorkerOutgoingMessageType.DECOMPRESS_RESULT;
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

export type CacheDisposedMessage = {
  type: WorkerOutgoingMessageType.CACHE_DISPOSED_FILENAME;
  fileName: string;
};

export type CacheCachedFileNameMessage = {
  type: WorkerOutgoingMessageType.CACHED_FILENAME;
  fileName: string;
};

export type ClearCacheMessage = {
  type: WorkerIncomingMessageType.CLEAR_CACHE;
};

export type ErrorMessage = {
  type: WorkerOutgoingMessageType.ERROR;
  error: string;
};

export type DecompressBatchMessage = {
  type: WorkerIncomingMessageType.DECOMPRESS_BATCH;
  files: File[];
};

export type DecompressBatchResultMessage = {
  type: WorkerOutgoingMessageType.DECOMPRESS_RESULT;
  batchData: Blob[];
  originalFiles: File[];
};

export type WorkerOutgoingMessage =
  | DecompressResultMessage
  | StatusMessage
  | ErrorMessage
  | CacheStatsResultMessage
  | CacheDisposedMessage
  | CacheCachedFileNameMessage
  | DecompressBatchResultMessage;

export type WorkerIncomingMessage =
  | DecompressMessage
  | CacheStatsMessage
  | ClearCacheMessage
  | DecompressBatchMessage;

// Type guards
export const isDecompressMessage = (
  e: MessageEvent<WorkerIncomingMessage>
): e is MessageEvent<DecompressMessage> => {
  return e.data.type === WorkerIncomingMessageType.DECOMPRESS;
};

export const isDecompressBatchMessage = (
  e: MessageEvent<WorkerIncomingMessage>
): e is MessageEvent<DecompressBatchMessage> => {
  return e.data.type === WorkerIncomingMessageType.DECOMPRESS_BATCH;
};
