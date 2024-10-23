import assert from 'node:assert';
import fs from 'fs';
import { test, suite } from 'node:test';
import processFile from '../processFile.ts';
import collectMinPopulationInfo from '../collectMinPopulationInfo.ts';

const isDelimiter = byte => byte === 0x0A

suite('collectMinPopulationInfo', () => {
    test('it should parse the last line without \n at the end of last line', (t) => {
        const chunk = Buffer.from(`2994701	Roc Meler	Roc Meler	Roc Mele,Roc Meler,Roc Mélé	42.58765	1.7418	T	PK	AD	AD,FR	02				0	2811	2348	Europe/Andorra	2023-10-03
3038999	Soldeu	Soldeu	Sol'deu,Soldeu,surudeu,swldw,Сольдеу,סולדאו,سولدو,スルデウ	42.57688	1.66769	P	PPL	AD		02				602		1832	Europe/Andorra	2017-11-06
3039000	Solana del Solanyó	Solana del Solanyo		42.53909	1.54785	T	SLP	AD		04				30		1679	Europe/Andorra	2015-02-06`);

        const countryData = new Map();
        collectMinPopulationInfo(countryData)(chunk, isDelimiter, true);

        assert.equal(countryData.get('AD').population, 30);
    });

    test('negative population excluded from results', () => {
        const chunk = Buffer.from(`2994701	Roc Meler	Roc Meler	Roc Mele,Roc Meler,Roc Mélé	42.58765	1.7418	T	PK	AD	AD,FR	02				0	2811	2348	Europe/Andorra	2023-10-03
3038999	Soldeu	Soldeu	Sol'deu,Soldeu,surudeu,swldw,Сольдеу,סולדאו,سولدو,スルデウ	42.57688	1.66769	P	PPL	AD		02				602		1832	Europe/Andorra	2017-11-06
3039000	Solana del Solanyó	Solana del Solanyo		42.53909	1.54785	T	SLP	AD		04				-20		1679	Europe/Andorra	2015-02-06
`);

        const countryData = new Map();
        collectMinPopulationInfo(countryData)(chunk, isDelimiter);

        assert.equal(countryData.get('AD').population, 602);
    });

    test('leftover returning if chucnk doesn\'t have enough bytes to read a character', () => {
        const chunk = Buffer.from(`2994701	Roc Meler	Roc Meler	Roc Mele,Roc Meler,Roc Mélé	42.58765	1.7418	T	PK	AD	AD,FR	02				0	2811	2348	Europe/Andorra	2023-10-03
3038999	Soldeu	Soldeu	Sol'deu,Soldeu,surudeu,swldw,Сольдеу,סולדאו,سولدو,スルデウ	42.57688	1.66769	P	PPL	AD		02				602		1832	Europe/Andorra	2017-11-06
3039000	Solana del Solanyó`);

        const countryData = new Map();
        // ó is 2 bytes character (0xC3 0xB3), remove second byte
        const leftOver = collectMinPopulationInfo(countryData)(chunk.subarray(0, -1), isDelimiter);

        // left over contains as the last byte the first byte of ó
        assert.equal(leftOver.at(-1), 0xC3);
    });
});