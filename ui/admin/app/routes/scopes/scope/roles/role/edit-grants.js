/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
export default class ScopesScopeRolesRoleEditGrantsRoute extends Route {
  @service store;

  async model() {
    const role = this.modelFor('scopes.scope.roles.role');
    let grantsSchema = { resource_types: [] };

    try {
      grantsSchema = await this.fetchGrantsSchema();
    } catch {
      // TODO: Return an error message
    }

    return { role, grantsSchema };
  }

  async fetchGrantsSchema() {
    const adapter = this.store.adapterFor('application');
    const url = `${adapter.host ?? ''}/grants-schema.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch grants schema');
    }
    return response.json();
  }
}
