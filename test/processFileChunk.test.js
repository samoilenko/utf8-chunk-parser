import fs from 'fs';
import { test, suite, before, after } from 'node:test';
import assert from 'node:assert';
import processFileChunk from '../processFileChunk.ts';

// Sample content for testing
const SAMPLE_DATA = `line1\nline2\nline3\nline4\nline5\n`;

// Helper function to create a test file
function createTestFile(content) {
    const filePath = './test-file.txt';
    fs.writeFileSync(filePath, content);
    return filePath;
}

// Helper function to remove the test file after tests
function deleteTestFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

// Newline delimiter check
const isNewLine = (byte) => byte === 10; // ASCII code for '\n'

// Helper to collect data during processing
function collectChunkData() {
    const collected = [];

    return {
        collectData: (data, isDelimiter, isLastChunk = false) => {
            const lines = data.toString().split('\n');
            let leftover = Buffer.from(lines.pop() || ''); // Keep the last incomplete line as leftover
            if (isLastChunk && leftover.length > 0) {
                lines.push(leftover.toString()); // Push leftover as a full line if it's the last chunk
                leftover = Buffer.alloc(0); // Reset leftover
            }

            collected.push(...lines.map(line => line + '\n').filter(line => line.trim() !== ''));

            return leftover;
        },
        getCollected: () => collected
    };
}

suite('processFileChunk', () => {
    let filePath;

    // Create the test file before running the tests
    before(() => {
        filePath = createTestFile(SAMPLE_DATA);
    });

    // Delete the test file after all tests complete
    after(() => {
        deleteTestFile(filePath);
    });

    test('processes entire file in one chunk', () => {
        const { collectData, getCollected } = collectChunkData();

        processFileChunk({
            filePath,
            start: 0,
            end: SAMPLE_DATA.length,
            chunkSize: 100, // Large enough to read the whole file
            collectData,
            isDelimiter: isNewLine,
        });

        assert.deepEqual(getCollected(), [ 'line1\n', 'line2\n', 'line3\n', 'line4\n', 'line5\n' ]);
    });

    test('processes file in multiple chunks', () => {
        const { collectData, getCollected } = collectChunkData();

        processFileChunk({
            filePath,
            start: 0,
            end: SAMPLE_DATA.length,
            chunkSize: 10, // Smaller chunk size to trigger multiple reads
            collectData,
            isDelimiter: isNewLine,
        });

        assert.deepEqual(getCollected(), [
            'line1\n',
            'line2\n',
            'line3\n',
            'line4\n',
            'line5\n'
        ]);
    });

    test('handles partial line between chunks correctly', () => {
        const { collectData, getCollected } = collectChunkData();

        processFileChunk({
            filePath,
            start: 0,
            end: SAMPLE_DATA.length - 2, // Simulate partial last chunk
            chunkSize: 8,
            collectData,
            isDelimiter: isNewLine,
        });

        assert.deepEqual(getCollected(), [
            'line1\n',
            'line2\n',
            'line3\n',
            'line4\n',
            'line5\n'
        ]);
    });

    test('adjusts start offset to avoid splitting lines', () => {
        const { collectData, getCollected } = collectChunkData();

        processFileChunk({
            filePath,
            start: 6, // Start within 'line2'
            end: SAMPLE_DATA.length,
            chunkSize: 10,
            collectData,
            isDelimiter: isNewLine,
        });

        assert.deepEqual(getCollected(), [
            'line3\n',
            'line4\n',
            'line5\n'
        ]);
    });

    test('adjusts end offset to read next line', () => {
        const { collectData, getCollected } = collectChunkData();

        processFileChunk({
            filePath,
            start: 0,
            end: 2,
            chunkSize: 10,
            collectData,
            isDelimiter: isNewLine,
        });

        assert.deepEqual(getCollected(), [
            'line1\n'
        ]);
    });
});