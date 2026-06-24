// Copyright (c) 2022 Upwave, All Rights Reserved

'use strict';

jest.mock('@actions/core');

import * as core from '@actions/core';
import { ActionMode, NewActionArgs, NewActionMode } from './actionArgs';

const mockedGetInput = jest.mocked(core.getInput);

describe('NewActionMode', () => {
    test('maps "tag" to ActionMode.TAG', () => {
        expect(NewActionMode('tag')).toBe(ActionMode.TAG);
    });

    test('maps "list" to ActionMode.LIST', () => {
        expect(NewActionMode('list')).toBe(ActionMode.LIST);
    });

    test('is case-insensitive', () => {
        expect(NewActionMode('TAG')).toBe(ActionMode.TAG);
        expect(NewActionMode('List')).toBe(ActionMode.LIST);
    });

    test('returns undefined for an unknown mode', () => {
        expect(NewActionMode('bogus')).toBeUndefined();
    });
});

describe('NewActionArgs', () => {
    beforeEach(() => jest.clearAllMocks());

    test('reads the mode from the "mode" action input', () => {
        mockedGetInput.mockReturnValue('tag');

        const args = NewActionArgs();

        expect(mockedGetInput).toHaveBeenCalledWith('mode');
        expect(args.mode).toBe(ActionMode.TAG);
        expect(args.prefix).toBe('');
    });
});
