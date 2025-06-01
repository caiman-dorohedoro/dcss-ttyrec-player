// TTYRec frame type definition
type TtyrecFrame = {
  sec: number; // seconds
  usec: number; // microseconds
  len: number; // data length
  data: Uint8Array; // data
};

/**
 * Function to merge multiple ttyrec files into one
 * @param files ArrayBuffers
 * @returns Merged ttyrec file (ArrayBuffer)
 */
const mergeTtyrecFiles = (files: ArrayBuffer[]): ArrayBuffer => {
  const mergedFrames: TtyrecFrame[] = [];
  let currentSec = 0;

  const fileFrames: TtyrecFrame[][] = files.map((file: ArrayBuffer) => {
    const view = new DataView(file);
    const frames: TtyrecFrame[] = [];

    let offset = 0;
    while (offset < file.byteLength) {
      const sec = view.getUint32(offset, true);
      const usec = view.getUint32(offset + 4, true);
      const len = view.getUint32(offset + 8, true);
      const data = new Uint8Array(file, offset + 12, len);
      frames.push({ sec, usec, len, data });
      offset += 12 + len;
    }

    return frames;
  });

  fileFrames.forEach((frames) => {
    const [firstFrame] = frames;
    const baseSec = firstFrame.sec;

    const newFrames = frames.map((frame) => {
      const sec =
        currentSec === 0
          ? frame.sec - baseSec // 첫 번째 파일: 0부터 시작하도록 baseSec를 빼기
          : currentSec + (frame.sec - baseSec); // 이후 파일들: currentSec 기준으로 변환

      const result = {
        sec,
        usec: frame.usec,
        len: frame.len,
        data: frame.data,
      };

      if (result.usec < 0) {
        result.sec -= 1;
        result.usec += 1000000;
      }

      if (result.usec >= 1000000) {
        result.sec += 1;
        result.usec -= 1000000;
      }

      return result;
    });

    currentSec = newFrames[newFrames.length - 1].sec + 1;

    // Spreading large arrays can cause stack overflow
    // Use for loop instead of mergedFrames.push(...newFrames);
    for (let i = 0; i < newFrames.length; i++) {
      mergedFrames.push(newFrames[i]);
    }
  });

  // Convert merged frames to binary data
  const totalLength = mergedFrames.reduce(
    (acc, frame) => acc + 12 + frame.len,
    0
  );
  const mergedBuffer = new ArrayBuffer(totalLength);
  const mergedView = new DataView(mergedBuffer);
  let offset = 0;

  mergedFrames.forEach((frame) => {
    mergedView.setUint32(offset, frame.sec, true);
    mergedView.setUint32(offset + 4, frame.usec, true);
    mergedView.setUint32(offset + 8, frame.len, true);
    const dataView = new Uint8Array(mergedBuffer, offset + 12, frame.len);
    dataView.set(frame.data);
    offset += 12 + frame.len;
  });

  return mergedBuffer;
};

export default mergeTtyrecFiles;
