import fs from 'fs';
export type ChunkParser = (
    chunk: Buffer,
    isDelimiter: (byte: number) => boolean, // lines delimiter
    isLastChunk?: boolean
) => Buffer;

function processFile(
    fd: number,
    chunkSize: number,
    processChunk: ChunkParser,
    isDelimiter: (byte: number) => boolean
) {
    const buffer = Buffer.alloc(chunkSize);
    let leftover = Buffer.alloc(0);  // To handle partial lines between chunks
    let bytesRead: number;

    while ((bytesRead = fs.readSync(fd, buffer, 0, chunkSize, null)) > 0) {
        const chunk: Buffer = Buffer.concat([leftover, buffer.subarray(0, bytesRead)]);  // Combine leftover from last chunk
        leftover = processChunk(chunk, isDelimiter);
    }

    if (leftover.length > 0) {
        processChunk(leftover, isDelimiter, true);
    }
}

export default processFile;