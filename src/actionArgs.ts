// Copyright (c) 2022 Upwave, All Rights Reserved

'use strict';

import * as core from '@actions/core';

/**
 * Defines the action arguments.
 */
export interface ActionArgs {
    mode: ActionMode;
    prefix: string;
}

/**
 * Construct action arguments.
 *
 * @constructor
 */
export function NewActionArgs(): ActionArgs {
    return {
        mode: NewActionMode(core.getInput('mode')),
        prefix: '',
    };
}

export enum ActionMode {
    LIST, // eslint-disable-line no-unused-vars -- it is used, not sure why this is failing lint
    TAG, // eslint-disable-line no-unused-vars -- it is used, not sure why this is failing lint
}

export function NewActionMode(source: string): ActionMode {
    return ActionMode[source as keyof typeof ActionMode];
}
