// Copyright (c) 2021 Upwave, All Rights Reserved

'use strict';

import { format } from 'util';

/**
 * Class definition of a Tag
 */
class Tag {
    prefix: string;
    year: number;
    month: number;
    day: number;
    build: number;

    /**
     * Constructs a Tag
     *
     * @param {string} prefix - an optional prefix to the tag
     * @param {Date} date - the date of the Tag
     * @param {number} build - the build number of the Tag
     */
    constructor(prefix: string, date: Date, build: number) {
        this.prefix = prefix;
        this.year = date.getFullYear();
        this.month = date.getMonth() + 1;
        this.day = date.getDate();
        this.build = build;
    }

    /**
     * Formats a Tag
     *
     * @returns {string} - the formatted Tag
     */
    toString(): string {
        return format(
            '%s%s.%s%s.%s',
            this.prefix,
            this.year,
            leadingZero(this.month),
            leadingZero(this.day),
            leadingZero(this.build),
        );
    }
}

/**
 * Creates the next Tag based on a prior Tag
 *
 * If the tag date exists and it's on or after the current date then use it and bump the build.
 * Else use the current date with build 1.
 *
 * @param {string} priorTag - the prior tag
 * @param {string} prefix - an optional prefix to the tag
 *
 * @returns {string} - a Tag containing the next tag
 */
export function create(priorTag: string, prefix: string): string {
    // start with current date and build 1
    const currentDate: Date = new Date(Date.now());
    let tagDate: Date = currentDate;
    let buildNumber: number = 1;

    // attempt to parse the prior tag
    const tagParts = priorTag.match(`^${prefix}(\\d{4})\\.(\\d{2})(\\d{2})\\.(\\d{2})$`);
    if (tagParts) {
        // switch tag date to date found in prior tag
        tagDate = new Date(
            Number.parseInt(tagParts[1]),
            Number.parseInt(tagParts[2], 10) - 1,
            Number.parseInt(tagParts[3], 10),
        );

        // get the YMD value for both dates
        const currentDateYMDValue = getDateYMDValue(currentDate);
        const tagDateYMDValue = getDateYMDValue(tagDate);

        if (tagDateYMDValue < currentDateYMDValue) {
            // switch tag date back to current
            tagDate = currentDate;
        } else {
            // bump the build number
            buildNumber = Number.parseInt(tagParts[4], 10) + 1;
        }
    }

    return new Tag(prefix, tagDate, buildNumber).toString();
}

/**
 * Gets the numeric YMD value from a date
 *
 * @param {Date} date - the date to compute the YMD value from
 *
 * @returns {number} - the YMD value
 */
function getDateYMDValue(date: Date): number {
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/**
 * Format a numeric value with a leading zero if required to make it 2 digits
 *
 * @param {number} val - the value to to format
 *
 * @returns {string} - the value conditionally formatted with a leading zero
 */
function leadingZero(val: number): string {
    const formatString = val < 10 ? '0%d' : '%d';
    return format(formatString, val);
}
