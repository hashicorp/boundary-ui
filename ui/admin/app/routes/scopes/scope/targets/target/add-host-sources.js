/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeTargetsTargetAddHostSourcesRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Empty out any previously loaded host sets.
   */
  beforeModel() {
    this.store.unloadAll('host-set');
  }

  /**
   * Returns the current target, all host catalogs, and all host sets.
   * @return {{target: TargetModel, hostCatalogs: [HostCatalogModel], hostSets: [HostSetModel]}}
   */
  async model() {
    const target = this.modelFor('scopes.scope.targets.target');
    const { id: scope_id } = this.modelFor('scopes.scope');
    const hostCatalogs = await this.store.query('host-catalog', {
      scope_id,
      query: { filters: { scope_id: [{ equals: scope_id }] } },
    });

    // TODO: For some reason, not returning promises fixes
    //  an ember bug similar to this reported issue:
    //  https://github.com/emberjs/data/issues/8299.
    //  This is a temporary fix until we can find a better solution or
    //  we upgrade ember data to try to fix the issue.
    await Promise.all(
      hostCatalogs.map(({ id: host_catalog_id }) => {
        this.store.query('host-set', { host_catalog_id });
      }),
    );
    const hostSets = this.store.peekAll('host-set');
    return {
      target,
      hostCatalogs,
      hostSets,
    };
  }
}
