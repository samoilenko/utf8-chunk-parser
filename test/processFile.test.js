import assert from 'node:assert';
import fs from 'fs';
import { test, suite } from 'node:test';
import processFile from '../processFile.ts';
import getCharacterLength from '../getCharacterLength.ts';

suite('processFile', () => {
    test('reading and processing data', (t) => {

        // 🍕, 𐍈, 字
        const data = new Uint8Array([0xF0, 0x9F, 0x8D, 0x95, 0xE5, 0xAD, 0x97, 0xF0, 0x90, 0x8D, 0x88])

        let globalOffset = 0;
        t.mock.method(fs, 'readSync', /** @param {NodeJS.ArrayBufferView} buffer */ (fd, buffer, offset, length, position) => {
            if (globalOffset > data.length)
                return 0;

            for (let i = 0; i < length; i++) {
                if (globalOffset > data.length) {
                    return i - 1;
                }

                buffer[i] = data[globalOffset];
                globalOffset++;
            }

            return globalOffset;
        });

        const res = [];
        // read more than 1 biggest UTF8 character
        // in this way left over will be tested
        processFile(4, 5, (data) => {
            const length = getCharacterLength(data[0]);
            res.push(data.subarray(0, length));

            // left over after each reading
            if (res.length === 1) {
                assert.strictEqual(data.subarray(length).length, 1);
            } else if (res.length === 2) {
                assert.strictEqual(data.subarray(length).length, 3);
            } else if (res.length === 3) {
                assert.strictEqual(data.subarray(length).length, 0);
            }
            return data.subarray(length);
        });

        assert.strictEqual(res[0][0], 0xF0);
        assert.strictEqual(res[1][0], 0xE5);
        assert.strictEqual(res[2][0], 0xF0);
        assert.strictEqual(res[2][1], 0x90);
    });
});
