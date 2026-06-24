// Copyright (c) 2022 Upwave, All Rights Reserved

'use strict';

jest.mock('@actions/core');
jest.mock('./tagger');

import * as core from '@actions/core';
import { commit, formatPrefix, getNextTag, getPriorTag } from './tagger';
import { Action } from './action';
import { ActionMode } from './actionArgs';

const mockedFormatPrefix = jest.mocked(formatPrefix);
const mockedGetPriorTag = jest.mocked(getPriorTag);
const mockedGetNextTag = jest.mocked(getNextTag);
const mockedCommit = jest.mocked(commit);
const mockedExportVariable = jest.mocked(core.exportVariable);
const mockedSetFailed = jest.mocked(core.setFailed);

describe('Action.run', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedFormatPrefix.mockReturnValue('');
    });

    test('LIST mode exports the prior tag and does not commit', async () => {
        mockedGetPriorTag.mockReturnValue('2021.0109.01');

        await Action.run({ mode: ActionMode.LIST, prefix: '' });

        expect(mockedGetPriorTag).toHaveBeenCalledWith('');
        expect(mockedExportVariable).toHaveBeenCalledWith('DEPLOY_VERSION', '2021.0109.01');
        expect(mockedGetNextTag).not.toHaveBeenCalled();
        expect(mockedCommit).not.toHaveBeenCalled();
    });

    test('TAG mode computes the next tag, commits it, and exports it', async () => {
        mockedGetPriorTag.mockReturnValue('2021.0109.01');
        mockedGetNextTag.mockReturnValue('2021.0109.02');

        await Action.run({ mode: ActionMode.TAG, prefix: '' });

        expect(mockedGetNextTag).toHaveBeenCalledWith('2021.0109.01', '');
        expect(mockedCommit).toHaveBeenCalledWith('2021.0109.02');
        expect(mockedExportVariable).toHaveBeenCalledWith('DEPLOY_VERSION', '2021.0109.02');
    });

    test('reports failures via core.setFailed instead of throwing', async () => {
        const boom = new Error('boom');
        mockedGetPriorTag.mockImplementation(() => {
            throw boom;
        });

        await expect(Action.run({ mode: ActionMode.TAG, prefix: '' })).resolves.toBeUndefined();

        expect(mockedSetFailed).toHaveBeenCalledWith(boom);
        expect(mockedCommit).not.toHaveBeenCalled();
    });
});
