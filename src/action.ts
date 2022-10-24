// Copyright (c) 2022 Upwave, All Rights Reserved

'use strict';

import { ActionArgs, ActionMode } from './actionArgs';
import * as core from '@actions/core';
import { commit, formatPrefix, getNextTag, getPriorTag } from './tagger';

export namespace Action {
    /**
     * Runs the action.
     *
     * @param args
     */
    export async function run(args: ActionArgs) {
        try {
            switch (args.mode) {
                case ActionMode.LIST:
                    await runList(args);
                    break;
                case ActionMode.TAG:
                    await runTag(args);
                    break;
                default:
                    console.log(`mode[${args.mode}] is unknown`);
                    break;
            }
        } catch (e: any) {
            core.setFailed(e);
        }
    }
}

async function runList(args: ActionArgs) {
    const prefix: string = formatPrefix(args.prefix);
    let priorTag: string = getPriorTag(prefix);

    core.exportVariable('DEPLOY_VERSION', priorTag);
    core.info(`exported variable DEPLOY_VERSION=${priorTag}`);
}

async function runTag(args: ActionArgs) {
    const prefix: string = formatPrefix(args.prefix);
    const priorTag: string = getPriorTag(prefix);
    const nextTag: string = getNextTag(priorTag, prefix);
    commit(nextTag);

    core.exportVariable('DEPLOY_VERSION', nextTag);
    core.info(`exported variable DEPLOY_VERSION=${nextTag}`);
}
