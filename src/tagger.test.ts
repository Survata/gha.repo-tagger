// Copyright (c) 2021 Upwave, All Rights Reserved

'use strict';

jest.mock('child_process');

import { execSync } from 'child_process';
import { commit, formatPrefix, getNextTag, getPriorTag } from './tagger';

const mockedExecSync = jest.mocked(execSync);

describe('formatPrefix', () => {
    test('with no prefix', () => {
        expect(formatPrefix('')).toBe('');
    });

    test('with prefix', () => {
        expect(formatPrefix('abc')).toBe('abc-');
    });

    test('with prefix that has spaces', () => {
        expect(formatPrefix('to be or not to be')).toBe('to-be-or-not-to-be-');
    });
});

describe('getPriorTag', () => {
    beforeEach(() => jest.clearAllMocks());

    test('returns the most recent matching git tag', () => {
        mockedExecSync.mockReturnValue(Buffer.from('2021.0109.01\n'));

        expect(getPriorTag('')).toBe('2021.0109.01');
        expect(mockedExecSync).toHaveBeenCalledWith(
            expect.stringContaining('git tag -l'),
            expect.anything(),
        );
    });

    test('strips the prefix when versionOnly is true', () => {
        mockedExecSync.mockReturnValue(Buffer.from('abc-2021.0109.01\n'));

        expect(getPriorTag('abc-', true)).toBe('2021.0109.01');
    });

    test('returns "unknown" when the git command fails', () => {
        mockedExecSync.mockImplementation(() => {
            throw new Error('git not found');
        });

        expect(getPriorTag('')).toBe('unknown');
    });
});

describe('commit', () => {
    beforeEach(() => jest.clearAllMocks());

    test('creates the tag and pushes it to origin', () => {
        mockedExecSync.mockReturnValue(Buffer.from(''));

        commit('2021.0109.02');

        expect(mockedExecSync).toHaveBeenCalledWith('git tag 2021.0109.02', expect.anything());
        expect(mockedExecSync).toHaveBeenCalledWith(
            'git push origin 2021.0109.02',
            expect.anything(),
        );
    });
});

describe('getNextTag', () => {
    // Uses a far-future prior tag so the "bump the build" branch is taken
    // regardless of the host timezone (see tag.test.ts for the dated cases).
    test('delegates to create() and bumps the build for a future-dated prior tag', () => {
        expect(getNextTag('2099.0101.05', '')).toBe('2099.0101.06');
    });

    test('preserves the prefix', () => {
        expect(getNextTag('rel-2099.0101.05', 'rel-')).toBe('rel-2099.0101.06');
    });
});
