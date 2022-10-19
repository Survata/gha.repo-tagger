// Copyright (c) 2021 Upwave, All Rights Reserved

'use strict';

import { execSync } from 'child_process';
import { create } from './tag';

/**
 * Executes a command
 *
 * @param {string} command - the command to run
 *
 * @returns {string} - the command output or 'unknown' if the command throws
 */
function execCommand(command: string): string {
    try {
        return execSync(command, { stdio: ['pipe', 'pipe', 'ignore'] })
            .toString()
            .trim();
    } catch (ex) {
        return 'unknown';
    }
}

/**
 * Gets the prior tag
 *
 * @param {string} prefix - an optional prefix to the tag
 * @param {boolean} versionOnly - flog to return only the version in the tag
 *
 * @returns {string} - the current tag
 */
export function getPriorTag(prefix: string, versionOnly: boolean = false): string {
    console.log(`prefix = [${prefix}]`)
    let priorTag: string = execCommand(
        `git tag -l ${prefix}[0-9][0-9][0-9][0-9].[0-9][0-9][0-9][0-9].[0-9][0-9] --sort=-v:refname | head -n 1`,
    );
    if (versionOnly) {
        priorTag = priorTag.replace(prefix, '');
    }
    return priorTag;
}

export function getNextTag(currentTag: string, prefix: string): string {
    return create(currentTag, prefix).toString();
}

export function commit(nextTag: string): void {
    execCommand('git tag ' + nextTag);
    execCommand('git push origin ' + nextTag);
}

export function formatPrefix(prefix: string): string {
    return prefix ? prefix.replace(/ /g, '-').concat('-') : '';
}
