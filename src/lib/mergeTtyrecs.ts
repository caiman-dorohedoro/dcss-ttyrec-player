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
  const currentTime: { sec: number; usec: number } = { sec: 0, usec: 0 }; // 누적 시간

  files.forEach((file: ArrayBuffer, fileIndex: number) => {
    const view = new DataView(file);
    let offset = 0;
    const fileFrames: TtyrecFrame[] = [];

    // 프레임 파싱
    while (offset < file.byteLength) {
      const sec = view.getUint32(offset, true);
      const usec = view.getUint32(offset + 4, true);
      const len = view.getUint32(offset + 8, true);
      const data = new Uint8Array(file, offset + 12, len);
      fileFrames.push({ sec, usec, len, data });
      offset += 12 + len;
    }

    if (fileFrames.length > 0) {
      const firstFrame = fileFrames[0];
      const baseSec = firstFrame.sec;
      const baseUsec = firstFrame.usec;

      // 파일의 프레임을 상대적인 시간으로 변환
      fileFrames.forEach((frame) => {
        let relativeSec = frame.sec - baseSec;
        let relativeUsec = frame.usec - baseUsec;

        // 음수 usec 보정
        while (relativeUsec < 0) {
          relativeSec -= 1;
          relativeUsec += 1000000;
        }

        // 누적 시간에 상대적인 시간 추가
        let adjustedSec = currentTime.sec + relativeSec;
        let adjustedUsec = currentTime.usec + relativeUsec;

        // usec가 1,000,000 이상일 경우 sec 증가
        while (adjustedUsec >= 1000000) {
          adjustedSec += 1;
          adjustedUsec -= 1000000;
        }

        mergedFrames.push({
          sec: adjustedSec,
          usec: adjustedUsec,
          len: frame.len,
          data: frame.data,
        });
      });

      // 파일의 마지막 프레임 시간 계산
      const lastFrame = fileFrames[fileFrames.length - 1];
      let totalSec = lastFrame.sec - baseSec;
      let totalUsec = lastFrame.usec - baseUsec;

      // 음수 usec 보정
      while (totalUsec < 0) {
        totalSec -= 1;
        totalUsec += 1000000;
      }

      // 누적 시간 업데이트
      currentTime.sec += totalSec;
      currentTime.usec += totalUsec;

      // usec가 1,000,000 이상일 경우 sec 증가
      while (currentTime.usec >= 1000000) {
        currentTime.sec += 1;
        currentTime.usec -= 1000000;
      }

      // 파일 간 1초 간격 추가 (마지막 파일 제외)
      if (fileIndex < files.length - 1) {
        currentTime.sec += 1;
      }
    }
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
