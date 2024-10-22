import getCharacterLength from './getCharacterLength.ts'
import type { ChunkParser } from './processFile.ts';
import isCityHasLessPopulation from './isCityHasLessPopulation.ts';

export type CityData = { cityName: string; population: number };

function parsePopulation(buffer: Buffer): number {
    let population = 0;
    let isNegative = false;
    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        if (byte === 0x2D) { // byte equals minus
            isNegative = true;
            continue;
        }
        if (byte === 0x2B) { // skip +
            continue;
        }
        if (byte >= 0x30 && byte <= 0x39) {  // ASCII '0' (0x30) to '9' (0x39)
            population = population * 10 + (byte - 0x30);  // Convert byte to numeric value
        } else {
            throw new Error(`Non-numeric byte found in population field: ${byte}`);
        }
    }
    return isNegative ? -1 * population : population;
}

function collectMinPopulationInfo(countryData: Map<string, CityData>): ChunkParser {
    return (chunk: Buffer, isDelimiter: (byte: number) => boolean, isLastChunk: boolean = false): Buffer => {
        let fieldIndex: number = 0; // first byte of the character
        let currentField = 0;  // Track the current field (columns)
        let countryCode = Buffer.alloc(0);
        let cityName: string = '';
        let population = 0;
        let newLineFirstByteIndex: number = 0;

        for (let i = 0; i < chunk.length;) {
            const byte = chunk[i];
            const charSize = getCharacterLength(byte);
            if (charSize === 0) {
                throw new Error(`Got not the first byte of a character: ${byte}`);
            }

            if (i + charSize > chunk.length) {
                // If we are at the end of the chunk and don't have enough bytes for the full character,
                // handle this in the next chunk by setting it as leftover
                return chunk.subarray(newLineFirstByteIndex);
            }

            i += charSize; // Move the index forward by the character size

            // It doesn't make sense to parse filed bigger than 14
            if (currentField <= 14 && byte === 0x09) { // Tab character '\t' indicates field end
                // Field has been fully read
                if (currentField === 1) {  // City name field
                    cityName = chunk.subarray(fieldIndex, i - charSize).toString();
                } else if (currentField === 8) {  // Country code field
                    countryCode = chunk.subarray(fieldIndex, i - charSize);
                } else if (currentField === 14) {  // Population field
                    population = parsePopulation(chunk.subarray(fieldIndex, i - charSize));
                }

                fieldIndex = i;
                currentField++;
            } else if (isDelimiter(byte)) {
                // Line has been fully read
                if (population > 0) {
                    const countryKey = countryCode.toString();
                    if (isCityHasLessPopulation(countryData, countryKey, population, cityName)) {
                        countryData.set(countryKey, { cityName, population });
                    }
                }

                // Reset for next line
                currentField = 0;
                countryCode = Buffer.alloc(0);
                cityName = '';
                population = 0;
                newLineFirstByteIndex = i;
            }
        }

        if (isLastChunk && population > 0) {
            const countryKey = countryCode.toString();
            if (isCityHasLessPopulation(countryData, countryKey, population, cityName)) {
                countryData.set(countryKey, { cityName, population });
            }
        }

        return isLastChunk ? Buffer.alloc(0) : chunk.subarray(newLineFirstByteIndex);
    }
}

export default collectMinPopulationInfo;
