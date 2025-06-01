import stripAnsi from "strip-ansi";

const stripAsciiControlCharacters = (str: string) => {
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x1F\x7F]/g, "");
};

const stripDCSSSpecificCharacters = (str: string) => {
  // # - wall
  // . - floor
  // ^ - trap
  return str.replace(/[.#]/g, "");
};

const stripNoiseChars = (str: string) => {
  return str.replace(/\[\d+d/g, "");
};

const trim = (str: string) => {
  return str.replace(/^\s+|\s+$/g, "");
};

const stripAll = (str: string) => {
  return trim(
    stripDCSSSpecificCharacters(
      stripAsciiControlCharacters(stripAnsi(stripNoiseChars(str)))
    )
  );
};

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

// Function to search for specific text in ttyrec file
function searchTtyrec(
  data: ArrayBuffer,
  searchText: string,
  isRegexMode: boolean
) {
  // Read entire file as buffer (consider stream processing for large files)
  const uint8Array = new Uint8Array(data);
  let offset = 0;
  let frameIndex = 0;
  let firstTimestamp = null; // Store first frame timestamp
  const results: TtyrecSearchResult[] = [];

  // Loop until end of buffer
  while (offset < uint8Array.length) {
    // Header requires 12 bytes (seconds, microseconds, data length)
    if (offset + 12 > uint8Array.length) break;

    // Read each field (assuming little endian)
    const view = new DataView(uint8Array.buffer);
    const sec = view.getUint32(offset, true);
    const usec = view.getUint32(offset + 4, true);
    const len = view.getUint32(offset + 8, true);
    offset += 12;

    if (!firstTimestamp) {
      firstTimestamp = { sec, usec };
    }

    // Calculate relative time: (current sec - start sec) + (current usec - start usec) / 1e6
    const relativeSec = sec - firstTimestamp.sec;
    const relativeUsec = usec - firstTimestamp.usec;
    const relativeTime = relativeSec + relativeUsec / 1e6;

    // Check if payload is sufficient
    if (offset + len > uint8Array.length) break;
    const payload = uint8Array.slice(offset, offset + len);
    offset += len;

    // Convert payload to string (may contain VT100 control characters)
    const payloadStr = new TextDecoder().decode(payload);
    const strippedPayloadStr = stripAll(payloadStr);

    if (!strippedPayloadStr) {
      frameIndex++;
      continue;
    }

    if (isRegexMode) {
      const regex = new RegExp(searchText, "i");
      if (regex.test(strippedPayloadStr)) {
        results.push({
          frame: frameIndex,
          timestamp: { sec, usec },
          relativeTimestamp: {
            sec: relativeSec,
            usec: relativeUsec,
            time: relativeTime,
          },
          textSnippet: strippedPayloadStr.slice(0, 100), // Preview only part of content
        });
      }
    }

    if (
      !isRegexMode &&
      strippedPayloadStr.length >= searchText.length &&
      strippedPayloadStr
        .toLocaleLowerCase()
        .includes(searchText.toLocaleLowerCase())
    ) {
      results.push({
        frame: frameIndex,
        timestamp: { sec, usec },
        relativeTimestamp: {
          sec: relativeSec,
          usec: relativeUsec,
          time: relativeTime,
        },
        textSnippet: strippedPayloadStr.slice(0, 100), // Preview only part of content
      });
    }

    frameIndex++;
  }

  return results;
}

export default searchTtyrec;
