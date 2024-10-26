import * as os from 'os';
import type { CityData } from './collectMinPopulationInfo.ts';
import processFileConcurrently from './processFileConcurrently.ts';
import isCityHasLessPopulation from './isCityHasLessPopulation.ts';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const folderPath = dirname(fileURLToPath(import.meta.url));
const numCPUs = os.cpus().length; // Get the number of available CPUs

const countryData = new Map<string, CityData>();
const handleResult = (data: Map<string, CityData>) => {
    data.forEach((cityData, countryCode) => {
        const savedCityData = countryData.get(countryCode);
        if (isCityHasLessPopulation(countryData, countryCode, cityData.population, cityData.cityName)) {
            countryData.set(countryCode, cityData);
        }
    })
};

processFileConcurrently<Map<string, CityData>>({
    filePath: `${folderPath}/allCountries.txt`,
    dataChunkSize: 1024 * 1024,
    threadCount: numCPUs,
    workerFileName: folderPath + '/collectMinPopulationWorker.ts',
    handleResult
});