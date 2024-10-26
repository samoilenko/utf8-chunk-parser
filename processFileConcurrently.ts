import { Worker } from 'worker_threads';
import fs from 'fs';

export type WorkerData = { filePath: string, start: number, end: number, chunkSize: number };

type TProcessFileConcurrently<T> = {
    filePath: string,
    dataChunkSize: number,
    threadCount: number,
    workerFileName: string,
    handleResult: (data: T) => void
}

/**
 * chunkSize is data that reads from file chunk
 */
function processFileConcurrently<T>({ filePath, dataChunkSize, threadCount, workerFileName, handleResult }: TProcessFileConcurrently<T>) {
    console.time('parallel');
    const fileSize = fs.statSync(filePath).size; // Get the size of the file in bytes
    const fileChunkSize = Math.ceil(fileSize / threadCount); // Calculate the chunk size for each CPU
    let completedWorkers: number = 0;

    function onWorkerExit() {
        completedWorkers++;
        if (completedWorkers === threadCount) {
            console.timeEnd('parallel');
        }
    }

    for (let i = 0; i < threadCount; i++) {
        const start = i * fileChunkSize;
        const end = (i === threadCount - 1) ? fileSize : start + fileChunkSize;
        const workerData: WorkerData = { filePath, start, end, chunkSize: dataChunkSize };
        const worker = new Worker(workerFileName, { workerData });

        worker.on('message', handleResult);
        worker.on('error', (error) => console.error(`Worker error: ${error}`));
        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
            onWorkerExit()
        });
    }
}

export default processFileConcurrently;
