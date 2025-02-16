export type TtyrecSearchResult = {
  frame: number;
  timestamp: { sec: number; usec: number };
  relativeTimestamp: {
    sec: number;
    usec: number;
    time: number;
  };
  textSnippet: string;
};

// ttyrec 파일에서 특정 텍스트를 검색하는 함수
function searchTtyrec(data: ArrayBuffer, searchText: string) {
  // 파일 전체를 버퍼로 읽기 (파일 크기가 큰 경우 스트림 처리 고려)
  const uint8Array = new Uint8Array(data);
  let offset = 0;
  let frameIndex = 0;
  let firstTimestamp = null; // 첫 프레임 타임스탬프 저장
  const results: TtyrecSearchResult[] = [];

  // 버퍼 끝까지 반복
  while (offset < uint8Array.length) {
    // 헤더가 12바이트 필요 (초, 마이크로초, 데이터 길이)
    if (offset + 12 > uint8Array.length) break;

    // 각 필드를 읽음 (리틀 엔디안으로 가정)
    const view = new DataView(uint8Array.buffer);
    const sec = view.getUint32(offset, true);
    const usec = view.getUint32(offset + 4, true);
    const len = view.getUint32(offset + 8, true);
    offset += 12;

    if (!firstTimestamp) {
      firstTimestamp = { sec, usec };
    }

    // 상대 시간 계산: (현재 초 - 시작 초) + (현재 usec - 시작 usec) / 1e6
    const relativeSec = sec - firstTimestamp.sec;
    const relativeUsec = usec - firstTimestamp.usec;
    const relativeTime = relativeSec + relativeUsec / 1e6;

    console.log(offset + len > uint8Array.length);
    // 페이로드가 충분한지 확인
    if (offset + len > uint8Array.length) break;
    const payload = uint8Array.slice(offset, offset + len);
    offset += len;

    // console.log("payload", payload);
    // 페이로드를 문자열로 변환 (VT100 제어문자가 포함될 수 있음)
    const payloadStr = new TextDecoder().decode(payload);
    console.log("payloadStr", payloadStr);
    if (payloadStr.includes(searchText)) {
      results.push({
        frame: frameIndex,
        timestamp: { sec, usec },
        relativeTimestamp: {
          sec: relativeSec,
          usec: relativeUsec,
          time: relativeTime,
        },
        textSnippet: payloadStr.slice(0, 100), // 일부 내용만 미리보기
      });
    }
    frameIndex++;
  }
  return results;
}

// // 사용 예제
// const filePath = "path/to/your/ttyrec"; // ttyrec 파일 경로
// const searchText = "찾고자 하는 텍스트";
// const foundFrames = searchTtyrec(filePath, searchText);

// if (foundFrames.length > 0) {
//   console.log("검색된 프레임:");
//   foundFrames.forEach((result) => {
//     console.log(
//       `프레임 ${result.frame} (타임스탬프: ${result.timestamp.sec}.${result.timestamp.usec})`
//     );
//     console.log("내용 미리보기:", result.textSnippet);
//   });
// } else {
//   console.log("해당 텍스트를 포함한 프레임이 없습니다.");
// }
//

export default searchTtyrec;
