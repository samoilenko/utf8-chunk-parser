import { parentPort, workerData } from 'worker_threads';
import collectMinPopulationInfo, { type CityData } from './collectMinPopulationInfo.ts';
import processFileChunk from './processFileChunk.ts';

const { filePath, start, end, chunkSize }: { filePath: string, start: number, end: number, chunkSize: number } = workerData;
const countryData = new Map<string, CityData>();

processFileChunk({
    collectData: collectMinPopulationInfo(countryData),
    isDelimiter: (byte: number) => byte === 0x0A,
    filePath,
    start,
    end,
    chunkSize
});

parentPort?.postMessage(countryData);

