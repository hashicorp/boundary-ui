/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Application from 'desktop/app';
import config from 'desktop/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import start from 'ember-exam/test-support/start';
import './helpers/flash-message';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();
