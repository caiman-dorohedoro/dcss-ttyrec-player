// TTYRec 프레임 타입 정의
interface TtyrecFrame {
  sec: number; // 초
  usec: number; // 마이크로초
  len: number; // 데이터 길이
  data: Uint8Array; // 데이터
}

/**
 * 여러 ttyrec 파일을 하나로 합치는 함수
 * @param files ArrayBuffer 형태의 ttyrec 파일 배열
 * @returns 합쳐진 ttyrec 파일 (ArrayBuffer)
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
    const diffSec = baseSec - currentSec < 1 ? 1 : baseSec - currentSec;

    const newFrames = frames.map((frame) => {
      const sec = currentSec === 0 ? 0 : frame.sec - diffSec;

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

    mergedFrames.push(...newFrames);
  });

  // 합쳐진 프레임을 바이너리 데이터로 변환
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
