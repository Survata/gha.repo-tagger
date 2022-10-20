// Copyright (c) 2022 Upwave, All Rights Reserved

'use strict';

import { ActionArgs, ActionMode } from './actionArgs';
import * as core from '@actions/core';
import { Command, Option } from 'commander';
import {formatPrefix, getNextTag, getPriorTag} from "./tagger";

export namespace Action {
    /**
     * Sets up the Command.
     *
     * @param program
     */
    export function setupCommand(program: Command) {
        const prefixOption: Option = new Option('-p, --prefix <prefix>', 'optional tag prefix');

        program.name('repo-tagger').version('1.0.0', '-v, --version', 'output the current version');

        program
            .command('list')
            .description('lists the current tag')
            .addOption(prefixOption)
            .action(async (options) => {
                const args: ActionArgs = {
                    mode: ActionMode.LIST,
                    prefix: options.prefix,
                };
                await run(args);
            });

        program
            .command('tag')
            .description('creates a new tag')
            .addOption(prefixOption)
            .action(async (options) => {
                const args: ActionArgs = {
                    mode: ActionMode.TAG,
                    prefix: options.prefix,
                };
                await run(args);
            });
    }

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
    console.log(priorTag);
}

async function runTag(args: ActionArgs) {
    const prefix: string = formatPrefix(args.prefix);
    const priorTag: string = getPriorTag(prefix);
    const nextTag: string = getNextTag(priorTag, prefix);
    // if (options.commit) {
    //   commit(nextTag);
    // }

    core.exportVariable('DEPLOY_VERSION', nextTag);
    core.info(`exported variable DEPLOY_VERSION=${nextTag}`);
}
