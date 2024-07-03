/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { TAG_TYPE_CONFIG } from 'api/models/worker';

export default class ScopesScopeWorkersWorkerTagsController extends Controller {
  @controller('scopes/scope/workers/index') workers;

  tagTypeConfig = TAG_TYPE_CONFIG;
}
