import fs from 'fs';
import processFile from './processFile.ts';
import collectMinPopulationInfo from './collectMinPopulationInfo.ts';
import type { CityData } from './collectMinPopulationInfo.ts';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const folderPath = dirname(fileURLToPath(import.meta.url));
const countryData1 = new Map<string, CityData>();

// one thread
// Open the file and start processing
const fd = fs.openSync('allCountries.txt', 'r');
const filePath = `${folderPath}/allCountries.txt`;
console.time('executionTime');
processFile(fd, 1024 * 1024, collectMinPopulationInfo(countryData1), (byte: number) => byte === 0x0A);  // 1 MB chunk size as an example
console.timeEnd('executionTime');
fs.closeSync(fd);
