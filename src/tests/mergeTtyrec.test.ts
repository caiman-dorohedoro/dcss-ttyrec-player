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

const createTtyrecBuffers = (
  frames: { sec: number; usec: number; text: string }[]
) => {
  return frames.map((frame) =>
    createTtyrecBuffer(frame.sec, frame.usec, frame.text)
  );
};

describe("mergeTtyrecFiles", () => {
  it("should merge ttyrec files correctly, exact case", () => {
    const buffer1 = createTtyrecBuffer(1, 0, "record 1");
    const buffer2 = createTtyrecBuffer(2, 0, "record 2");
    const buffer3 = createTtyrecBuffer(3, 0, "record 3");

    const mergedBuffer = mergeTtyrecFiles([buffer1, buffer2, buffer3]);

    expect(mergedBuffer).toBeDefined();
    expect(mergedBuffer.byteLength).toBe(
      buffer1.byteLength + buffer2.byteLength + buffer3.byteLength
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
    const buffer1 = createTtyrecBuffer(
      new Date("2025-03-20T12:00:00.000Z").getTime(),
      0,
      "record 1"
    );
    const buffer2 = createTtyrecBuffer(
      new Date("2025-03-20T13:00:00.000Z").getTime(),
      0,
      "record 2"
    );
    const buffer3 = createTtyrecBuffer(
      new Date("2025-03-20T13:01:00.000Z").getTime(),
      0,
      "record 3"
    );
    const buffer4 = createTtyrecBuffer(
      new Date("2025-03-20T13:01:00.000Z").getTime(),
      200,
      "record 4"
    );

    const mergedBuffer = mergeTtyrecFiles([buffer1, buffer2, buffer3, buffer4]);

    expect(mergedBuffer).toBeDefined();
    expect(mergedBuffer.byteLength).toBe(
      buffer1.byteLength +
        buffer2.byteLength +
        buffer3.byteLength +
        buffer4.byteLength
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
    const buffers1 = createTtyrecBuffers([
      { sec: 1, usec: 0, text: "1 record 1" },
      { sec: 1, usec: 1000, text: "1 record 2" },
      { sec: 1, usec: 2000, text: "1 record 3" },
    ]);

    const buffers2 = createTtyrecBuffers([
      { sec: 100, usec: 0, text: "2 record 1" },
      { sec: 100, usec: 1000, text: "2 record 2" },
      { sec: 101, usec: 2000, text: "2 record 3" },
    ]);

    const mergedBuffer = mergeTtyrecFiles([...buffers1, ...buffers2]);

    const debugView = new DataView(mergedBuffer);
    let offset = 0;
    let frameIndex = 0;

    while (offset < mergedBuffer.byteLength) {
      const len = debugView.getUint32(offset + 8, true);

      offset += 12 + len;
      frameIndex++;
    }

    expect(mergedBuffer).toBeDefined();
    expect(mergedBuffer.byteLength).toBe(
      buffers1.reduce((acc, curr) => acc + curr.byteLength, 0) +
        buffers2.reduce((acc, curr) => acc + curr.byteLength, 0)
    );

    const mergedView = new DataView(mergedBuffer);
    expect(mergedView.getUint32(0, true)).toBe(0);
    expect(mergedView.getUint32(4, true)).toBe(0);
    expect(mergedView.getUint32(8, true)).toBe(10);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 12, 10))).toBe(
      "1 record 1"
    );

    expect(mergedView.getUint32(22, true)).toBe(1);
    expect(mergedView.getUint32(26, true)).toBe(1000);
    expect(mergedView.getUint32(30, true)).toBe(10);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 34, 10))).toBe(
      "1 record 2"
    );

    expect(mergedView.getUint32(44, true)).toBe(1);
    expect(mergedView.getUint32(48, true)).toBe(2000);
    expect(mergedView.getUint32(52, true)).toBe(10);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 56, 10))).toBe(
      "1 record 3"
    );

    expect(mergedView.getUint32(66, true)).toBe(100);
    expect(mergedView.getUint32(70, true)).toBe(0);
    expect(mergedView.getUint32(74, true)).toBe(10);
    expect(new TextDecoder().decode(new Uint8Array(mergedBuffer, 78, 10))).toBe(
      "2 record 1"
    );

    expect(mergedView.getUint32(88, true)).toBe(100);
    expect(mergedView.getUint32(92, true)).toBe(1000);
    expect(mergedView.getUint32(96, true)).toBe(10);
    expect(
      new TextDecoder().decode(new Uint8Array(mergedBuffer, 100, 10))
    ).toBe("2 record 2");

    expect(mergedView.getUint32(110, true)).toBe(101);
    expect(mergedView.getUint32(114, true)).toBe(2000);
    expect(mergedView.getUint32(118, true)).toBe(10);
    expect(
      new TextDecoder().decode(new Uint8Array(mergedBuffer, 122, 10))
    ).toBe("2 record 3");
  });
});
