/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeRolesRoleEditGrantsRoute extends Route {
  // =services

  @service grantsSchema;

  // =methods

  async model() {
    await this.grantsSchema.load();
  }
}
