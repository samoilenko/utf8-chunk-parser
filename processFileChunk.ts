import fs from 'fs';

type TProcessFileChunk = {
    filePath: string,
    start: number,
    end: number,
    chunkSize: number,
    collectData: (data: Buffer, isDelimiter: (byte: number) => boolean, isLastChunk?: boolean) => Buffer,
    isDelimiter: (byte: number) => boolean
}

// find the first condition of the chunk end
// or return the data from offset till the end of the file
function getBytesUntilEndOfDelimiter(fd: number, offset: number, isDelimiter: (byte: number) => boolean, chunkSize: number = 100): Buffer {
    let lastLeftOver = Buffer.alloc(0);
    let bytesRead: number;
    const buffer = Buffer.alloc(chunkSize);

    while (bytesRead = fs.readSync(fd, buffer, 0, chunkSize, offset)) {
        for (let i = 0; i < bytesRead; i++) {
            if (isDelimiter(buffer[i])) {
                return Buffer.concat([lastLeftOver, buffer.subarray(0, i)]);
            }
        }
        offset += bytesRead;
        lastLeftOver = Buffer.concat([lastLeftOver, buffer.subarray(0, bytesRead)]);
    }

    return lastLeftOver;
}

function moveOffsetToDelimiter(fd: number, initOffset: number, isDelimiter: (byte: number) => boolean): number {
    let offset = initOffset;
    let buffer = Buffer.alloc(1);
    // Read a few bytes to find the delimiter
    let byteRead = fs.readSync(fd, buffer, 0, 1, offset);
    while (byteRead > 0 && !isDelimiter(buffer[0])) {
        offset++;
        byteRead = fs.readSync(fd, buffer, 0, 1, offset);
    }
    offset++;

    return offset;
}

function processFileChunk(params: TProcessFileChunk) {
    const { collectData, isDelimiter, filePath, start } = params;
    const end = params.end + 1;
    const chunkSize = end - start < params.chunkSize ? end - start : params.chunkSize;
    const fd = fs.openSync(filePath, 'r');

    const buffer = Buffer.alloc(chunkSize);
    let leftover = Buffer.alloc(0);  // To handle partial lines between chunks
    let bytesRead: number;
    let offset = start;

    // Adjust offset if not the first chunk
    // the idea here is to find a byte next after delimiter and start collecting data from that place
    if (start !== 0) {
        offset = moveOffsetToDelimiter(fd, offset, isDelimiter);
    }

    while (offset < end) {
        bytesRead = fs.readSync(fd, buffer, 0, chunkSize, offset);
        if (bytesRead === 0 && leftover.length === 0) {
            break;
        }

        const chunk: Buffer = Buffer.concat([leftover, buffer.subarray(0, bytesRead)]); // Combine leftover from last chunk
        leftover = collectData(chunk, isDelimiter);
        offset += chunkSize;
    }

    if (leftover.length > 0) {
        const bytesBeforeNewLine = getBytesUntilEndOfDelimiter(fd, offset, isDelimiter);
        collectData(Buffer.concat([leftover, bytesBeforeNewLine]), isDelimiter, true);
    }

    fs.closeSync(fd);
}

export default processFileChunk;