import { type CityData } from './collectMinPopulationInfo.ts';

const isCityHasLessPopulation = (
    countryData: Map<string, CityData>,
    countryKey: string,
    population: number,
    cityName: string
): boolean => {
    if (!countryData.has(countryKey))
        return true;

    const existingData = countryData.get(countryKey)!;
    if (population < existingData.population)
        return true;

    if (population === existingData.population) {
        // Compare city names alphabetically if populations are equal
        return cityName.localeCompare(existingData.cityName) < 0;
    }

    return false;
}

export default isCityHasLessPopulation;