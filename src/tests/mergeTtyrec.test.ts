import mergeTtyrecFiles from "../lib/mergeTtyrecs";

const createTtyrecBuffer = (sec: number, usec: number, text: string) => {
  const buffer = new ArrayBuffer(12 + text.length);
  const view = new DataView(buffer);
  view.setUint32(0, sec, true);
  view.setUint32(4, usec, true);
  view.setUint32(8, text.length, true);

  new Uint8Array(buffer, 12, text.length).set(new TextEncoder().encode(text));

  return buffer;
};

const createTtyrecFiles = (
  frames: { sec: number; usec: number; text: string }[]
): ArrayBuffer => {
  const buffers = frames.map((frame) =>
    createTtyrecBuffer(frame.sec, frame.usec, frame.text)
  );
  return concatBuffers(buffers);
};

function concatBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const result = new ArrayBuffer(totalLength);
  const resultArray = new Uint8Array(result);

  let offset = 0;
  for (const buffer of buffers) {
    resultArray.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  return result;
}

describe("mergeTtyrecFiles", () => {
  it("should merge ttyrec files correctly, exact case", () => {
    // 개별 프레임 대신 파일 사용
    const file1 = createTtyrecFiles([{ sec: 1, usec: 0, text: "record 1" }]);
    const file2 = createTtyrecFiles([{ sec: 2, usec: 0, text: "record 2" }]);
    const file3 = createTtyrecFiles([{ sec: 3, usec: 0, text: "record 3" }]);

    const mergedBuffer = mergeTtyrecFiles([file1, file2, file3]);

    expect(mergedBuffer).toBeDefined();
    expect(mergedBuffer.byteLength).toBe(
      file1.byteLength + file2.byteLength + file3.byteLength
    );

    const mergedView = new DataView(mergedBuffer);
    expect(mergedView.getUint32(0, true)).toBe(0);
    expect(mergedView.getUint32(4, true)).toBe(0);
    expect(mergedView.getUint32(8, true)).toBe(8);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 12, 8))).toBe(
      "record 1"
    );

    expect(mergedView.getUint32(20, true)).toBe(1);
    expect(mergedView.getUint32(24, true)).toBe(0);
    expect(mergedView.getUint32(28, true)).toBe(8);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 32, 8))).toBe(
      "record 2"
    );

    expect(mergedView.getUint32(40, true)).toBe(2);
    expect(mergedView.getUint32(44, true)).toBe(0);
    expect(mergedView.getUint32(48, true)).toBe(8);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 52, 8))).toBe(
      "record 3"
    );
  });

  it("should merge ttyrec files correctly, different time diff - 1", () => {
    // 개별 프레임 대신 파일 사용
    const file1 = createTtyrecFiles([
      {
        sec: new Date("2025-03-20T12:00:00.000Z").getTime(),
        usec: 0,
        text: "record 1",
      },
    ]);

    const file2 = createTtyrecFiles([
      {
        sec: new Date("2025-03-20T13:00:00.000Z").getTime(),
        usec: 0,
        text: "record 2",
      },
    ]);

    const file3 = createTtyrecFiles([
      {
        sec: new Date("2025-03-20T13:01:00.000Z").getTime(),
        usec: 0,
        text: "record 3",
      },
    ]);

    const file4 = createTtyrecFiles([
      {
        sec: new Date("2025-03-20T13:01:00.000Z").getTime(),
        usec: 200,
        text: "record 4",
      },
    ]);

    const mergedBuffer = mergeTtyrecFiles([file1, file2, file3, file4]);

    expect(mergedBuffer).toBeDefined();
    expect(mergedBuffer.byteLength).toBe(
      file1.byteLength + file2.byteLength + file3.byteLength + file4.byteLength
    );

    const mergedView = new DataView(mergedBuffer);
    expect(mergedView.getUint32(0, true)).toBe(0);
    expect(mergedView.getUint32(4, true)).toBe(0);
    expect(mergedView.getUint32(8, true)).toBe(8);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 12, 8))).toBe(
      "record 1"
    );

    expect(mergedView.getUint32(20, true)).toBe(1);
    expect(mergedView.getUint32(24, true)).toBe(0);
    expect(mergedView.getUint32(28, true)).toBe(8);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 32, 8))).toBe(
      "record 2"
    );

    expect(mergedView.getUint32(40, true)).toBe(2);
    expect(mergedView.getUint32(44, true)).toBe(0);
    expect(mergedView.getUint32(48, true)).toBe(8);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 52, 8))).toBe(
      "record 3"
    );

    expect(mergedView.getUint32(60, true)).toBe(3);
    expect(mergedView.getUint32(64, true)).toBe(200);
    expect(mergedView.getUint32(68, true)).toBe(8);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 72, 8))).toBe(
      "record 4"
    );
  });

  it("should merge ttyrec files correctly, different time diff - 2", () => {
    const frames1 = [
      { sec: 1, usec: 0, text: "1 record 1" },
      { sec: 1, usec: 1000, text: "1 record 2" },
      { sec: 1, usec: 2000, text: "1 record 3" },
    ];

    const frames2 = [
      { sec: 100, usec: 0, text: "2 record 1" },
      { sec: 100, usec: 1000, text: "2 record 2" },
      { sec: 101, usec: 2000, text: "2 record 3" },
    ];

    const frames3 = [
      { sec: 101, usec: 3000, text: "3 record 1" },
      { sec: 101, usec: 4000, text: "3 record 2" },
      { sec: 102, usec: 1000, text: "3 record 3" },
    ];

    // 각 파일의 모든 프레임을 하나의 연속된 버퍼로 만듭니다
    const file1Buffer = createTtyrecFiles(frames1);
    const file2Buffer = createTtyrecFiles(frames2);
    const file3Buffer = createTtyrecFiles(frames3);

    const mergedBuffer = mergeTtyrecFiles([
      file1Buffer,
      file2Buffer,
      file3Buffer,
    ]);

    expect(mergedBuffer).toBeDefined();
    expect(mergedBuffer.byteLength).toBe(
      file1Buffer.byteLength + file2Buffer.byteLength + file3Buffer.byteLength
    );

    const mergedView = new DataView(mergedBuffer);
    expect(mergedView.getUint32(0, true)).toBe(0);
    expect(mergedView.getUint32(4, true)).toBe(0);
    expect(mergedView.getUint32(8, true)).toBe(10);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 12, 10))).toBe(
      "1 record 1"
    );

    expect(mergedView.getUint32(22, true)).toBe(0);
    expect(mergedView.getUint32(26, true)).toBe(1000);
    expect(mergedView.getUint32(30, true)).toBe(10);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 34, 10))).toBe(
      "1 record 2"
    );

    expect(mergedView.getUint32(44, true)).toBe(0);
    expect(mergedView.getUint32(48, true)).toBe(2000);
    expect(mergedView.getUint32(52, true)).toBe(10);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 56, 10))).toBe(
      "1 record 3"
    );

    expect(mergedView.getUint32(66, true)).toBe(1);
    expect(mergedView.getUint32(70, true)).toBe(0);
    expect(mergedView.getUint32(74, true)).toBe(10);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 78, 10))).toBe(
      "2 record 1"
    );

    expect(mergedView.getUint32(88, true)).toBe(1);
    expect(mergedView.getUint32(92, true)).toBe(1000);
    expect(mergedView.getUint32(96, true)).toBe(10);
    expect(
      new TextDecoder().decode(new Uint8Array(mergedBuffer, 100, 10))
    ).toBe("2 record 2");

    expect(mergedView.getUint32(110, true)).toBe(2);
    expect(mergedView.getUint32(114, true)).toBe(2000);
    expect(mergedView.getUint32(118, true)).toBe(10);
    expect(
      new TextDecoder().decode(new Uint8Array(mergedBuffer, 122, 10))
    ).toBe("2 record 3");

    expect(mergedView.getUint32(132, true)).toBe(3);
    expect(mergedView.getUint32(136, true)).toBe(3000);
    expect(mergedView.getUint32(140, true)).toBe(10);
    expect(
      new TextDecoder().decode(new Uint8Array(mergedBuffer, 144, 10))
    ).toBe("3 record 1");

    expect(mergedView.getUint32(154, true)).toBe(3);
    expect(mergedView.getUint32(158, true)).toBe(4000);
    expect(mergedView.getUint32(162, true)).toBe(10);
    expect(
      new TextDecoder().decode(new Uint8Array(mergedBuffer, 166, 10))
    ).toBe("3 record 2");

    expect(mergedView.getUint32(176, true)).toBe(4);
    expect(mergedView.getUint32(180, true)).toBe(1000);
    expect(mergedView.getUint32(184, true)).toBe(10);
    expect(
      new TextDecoder().decode(new Uint8Array(mergedBuffer, 188, 10))
    ).toBe("3 record 3");
  });
});
