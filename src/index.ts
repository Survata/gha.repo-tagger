// Copyright (c) 2022 Upwave, All Rights Reserved

'use strict';

import { Action } from './action';
import { ActionArgs, NewActionArgs } from './actionArgs';

const args: ActionArgs = NewActionArgs();
Action.run(args).then();
