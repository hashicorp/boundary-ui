/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { modelMapping } from 'api/services/sqlite';
import { notifyError } from 'core/decorators/notify';

// Only resource types that have a name column are useful for ID suggestions
// Currently this excludes session-recording and sessions as they aren't likely to be used
// and could be expensive to load.
const NAMED_RESOURCE_TYPES = Object.keys(modelMapping).filter(
  (type) => 'name' in modelMapping[type],
);

export default class ScopesScopeRolesRoleEditGrantsRoute extends Route {
  @service store;

  async model() {
    const role = this.modelFor('scopes.scope.roles.role');
    let grantsSchema = { resource_types: [] };

    grantsSchema = await this.fetchGrantsSchema();

    // Kick off background loading of all supported resource types into DB without awaiting.
    this.loadResourcesTask.perform(role.scopeID);

    return {
      role,
      grantsSchema,
      loadResourcesTask: this.loadResourcesTask,
      searchableResourceTypes: NAMED_RESOURCE_TYPES,
    };
  }

  /**
   * Loads all supported resource types recursively so they are available
   * for ID autocompletion suggestions.
   */
  loadResourcesTask = dropTask(async (scopeId) => {
    await Promise.allSettled(
      NAMED_RESOURCE_TYPES.map((type) =>
        this.store.query(type, { scope_id: scopeId, recursive: true }),
      ),
    );
  });

  @notifyError(({ message }) => message, { catch: true })
  async fetchGrantsSchema() {
    const adapter = this.store.adapterFor('application');
    const url = `${adapter.host ?? ''}/internal/grants-schema.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch grants schema');
    }

    return response.json();
  }
}
