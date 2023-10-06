/*
 * Created Date: Wed Oct 04 2023
 * Author: David Haukeness david@hauken.us
 * Copyright (c) 2023 David Haukeness
 * Distributed under the terms of the GNU GENERAL PUBLIC LICENSE Version 3.0
 */

/**
 * Date, but only UTC operations
 */
class UTCDate {
    /**
     * returns a new instance of UTCDate
     * @param {string|number} date 
     */
    constructor(d = "0") {
        if (isNaN(d)) {
            // the user passed a string
            const [year, month, day] = parseDateString(d);
            this.date = new Date(Date.UTC(year, month - 1, day));
        } else {
            // the user passed a timestamp
            this.date = new Date(parseInt(d));
        }
    }

    /**
     * adds a number of hours to the current date
     * @param {number} hours the number of hours to add/subtract
     */
    addHours(hours) {
        let ms = hours*3600000;
        this.date = new Date(this.date.valueOf() + ms);
    }

    setHours(hours) {
        this.date.setUTCHours(hours);
    }

    getTime() {
        return this.date.getTime();
    }

    /**
     * gets the date in UTC
     * @returns UTC date string
     */
    toString() {
        return this.date.toUTCString();
    }

    /**
     * get the underlying date object
     * @returns {Date}
     */
    toDate() {
        return this.date;
    }

    /**
     * allows for time localization in discord.
     * @returns {string} the discord UTC timestamp tag
     */
    toDiscordString() {
        return `<t:${this.date.getTime()/1000}>`
    }

    /**
     * check if this UTCDate is valid
     * @returns {boolean} if the date is valid
     */
    isValid() {
        return !isNaN(this.date);
    }
}

/**
 * parses date string into [yyyy, mm, dd]
 * @param {string} ds a string with a date
 * @returns {Array<string>} [yyyy, mm, dd]
 */
function parseDateString(ds) {
    let parts = ds.split(/[-./\\]/).map(i => parseInt(i));
    if (parts[0].toString().length === 4) {
        // the format is yyyy/mm/dd
        return parts;
    }
    if (parts[2].toString().length === 4) {
        // its mm/dd/yyyy
        return [parts[2], parts[0], parts[1]];
    }
    throw new Error(`unable to parse '${ds}' as a date. are you missing a 4 digit year?`)
}

module.exports = {
    UTCDate: UTCDate,
    __testing: (process.env.NODE_ENV === 'test' ? {
        parseDateString,
    } : void 0),
}