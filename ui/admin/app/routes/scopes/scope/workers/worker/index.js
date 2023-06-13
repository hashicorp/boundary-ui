/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
