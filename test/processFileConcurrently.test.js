import { test, suite } from 'node:test';
import assert from 'node:assert';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import processFileConcurrently from '../processFileConcurrently.ts';
import { join } from 'path';

const folderPath = dirname(fileURLToPath(import.meta.url));

const sampleFilePath = join(folderPath, '/concurrent/sample.txt');
const mockWorkerPath = join(folderPath, '/concurrent/mockWorker.ts');

// Sample Map result to compare with worker output
const expectedResult = new Map([
    ['UA', { cityName: Buffer.from('Sumy'), population: 8000000 }]
]);


const handleResult = (data) => {
    assert.deepEqual(data, expectedResult);
};

suite('processFileConcurrently', () => {
    test('should process the file in parallel and return expected results', (t, done) => {
        processFileConcurrently({
            filePath: sampleFilePath,
            dataChunkSize: 1024, // 1KB chunks
            threadCount: 2,
            workerFileName: mockWorkerPath,
            handleResult
        });

        // Wait for workers to complete
        setTimeout(() => {
            done();
        }, 100);
    });
});