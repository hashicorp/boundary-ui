/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class ScopesScopeWorkersWorkerIndexRoute extends Route {
  @action
  cancel(worker) {
    worker.rollbackAttributes();
    this.refresh();
  }
}
