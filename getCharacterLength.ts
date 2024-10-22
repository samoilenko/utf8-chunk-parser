function getCharacterLength(byte: number): number {
    // this is the first byte of a 4 bytes character
    if ((byte & 0b11111000) === 0b11110000) {
        return 4;
    }

    if ((byte & 0b11110000) === 0b11100000) {
        return 3;
    }

    if ((byte & 0b11100000) === 0b11000000) {
        return 2;
    }

    if ((byte & 0b10000000) === 0) {
        return 1;
    }

    // this is a middle byte of a character
    if ((byte & 0b11000000) === 0b10000000) {
        return 0;
    }

    throw new Error(`${byte} is not related to UTF8 encoding`);
}

export default getCharacterLength;
