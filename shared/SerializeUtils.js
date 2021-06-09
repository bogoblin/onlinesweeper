/**
 *
 * @param data {String}
 * @param start {number}
 */
export const readCoords = (data, start) => {
    return data.substr(start).split(',').map(value => parseInt(value, 10));
}
