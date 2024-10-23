import { suite, test } from 'node:test';
import assert from 'node:assert';
import isCityHasLessPopulation from '../isCityHasLessPopulation.ts';

suite('isCityHasLessPopulation', () => {
    test('returns true when the country key does not exist', () => {
        const countryData = new Map();
        const result = isCityHasLessPopulation(countryData, 'US', 1000, 'New York');
        assert.strictEqual(result, true);
    });

    test('returns true when the new city has less population', () => {
        const countryData = new Map([
            ['US', { cityName: 'Los Angeles', population: 4000 }]
        ]);
        const result = isCityHasLessPopulation(countryData, 'US', 3000, 'New York');
        assert.strictEqual(result, true);
    });

    test('returns false when the new city has more population', () => {
        const countryData = new Map([
            ['US', { cityName: 'Los Angeles', population: 4000 }]
        ]);
        const result = isCityHasLessPopulation(countryData, 'US', 5000, 'San Francisco');
        assert.strictEqual(result, false);
    });

    test('returns true when populations are equal but new city name is alphabetically smaller', () => {
        const countryData = new Map([
            ['US', { cityName: 'San Francisco', population: 3000 }]
        ]);
        const result = isCityHasLessPopulation(countryData, 'US', 3000, 'New York');
        assert.strictEqual(result, true);
    });

    test('returns false when populations are equal but new city name is alphabetically larger', () => {
        const countryData = new Map([
            ['UA', { cityName: 'Lviv', population: 3000 }]
        ]);
        const result = isCityHasLessPopulation(countryData, 'UA', 3000, 'Sumy');
        assert.strictEqual(result, false);
    });
});
