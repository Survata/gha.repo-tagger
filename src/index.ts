// Copyright (c) 2022 Upwave, All Rights Reserved

'use strict';

// import { Util } from './util';
import { Action } from './action';
// import { program } from 'commander';
import { ActionArgs, NewActionArgs } from './actionArgs';

// if (Util.isTrue(process.env.GITHUB_ACTIONS)) {
    const args: ActionArgs = NewActionArgs();
    Action.run(args).then();
// } else {
//     Action.setupCommand(program);
//     program.parse(process.argv);
// }
