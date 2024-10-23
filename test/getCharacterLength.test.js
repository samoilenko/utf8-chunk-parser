import assert from 'node:assert';
import { mock, test, suite } from 'node:test';
import getCharacterLength from '../getCharacterLength.ts';

suite('getCharacterLength', () => {
    test('one byte symbol', (t) => {
        const length = getCharacterLength(Buffer.from('A')[0]);
        assert.strictEqual(length, 1);
    });

    test('2 bytes symbol', (t) => {
        const length = getCharacterLength(Buffer.from('é')[0]);
        assert.strictEqual(length, 2);
    });

    test('3 bytes symbol', (t) => {
        const length = getCharacterLength(Buffer.from('€')[0]);
        assert.strictEqual(length, 3);
    });

    test('4 bytes symbol', (t) => {
        const length = getCharacterLength(Buffer.from('🍕')[0]);
        assert.strictEqual(length, 4);
    });

    test('a not first symbol byte', (t) => {
        const length = getCharacterLength(Buffer.from('🍕')[2]);
        assert.strictEqual(length, 0);
    });

    test('a not UTF8 byte', (t) => {
        const byte = 0b11111000;

        try {
            const length = getCharacterLength(byte);
            throw new Error(`Got ${length}`);
        } catch (e) {
            assert.strictEqual(`${byte} is not related to UTF8 encoding`, e.message);
        }
    });
});
