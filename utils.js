/**
 * return current time as `HH:MM:SS`
 * @returns {string} the current time string
 */
function getCurrentTime() {
    const date = new Date();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

/**
 * get the cut string with max length
 * @param {string} text source string
 * @param {number} limit max length of the string
 * @returns {string} the cut string, replaced by `...`
 */
function getCutText(text, limit = 60) {
    if (limit < 5 || limit > text.length) {
        return text;
    }

    return text.slice(0, limit / 4) + '...' + text.slice(- limit / 4 * 3 + 3);
}

module.exports = {
    getCurrentTime,
    getCutText
};
