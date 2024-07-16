/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeWorkersIndexRoute extends Route {
  // =services

  @service store;
  @service can;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    releaseVersions: {
      refreshModel: true,
      replace: true,
    },
    page: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Loads queried workers
   * @returns {Promise<{totalItems: number, workers: [WorkerModel], allWorkers: [WorkerModel]}>}
   */
  async model({ search, releaseVersions, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    const filters = {
      scope_id: [{ equals: scope_id }],
      release_version: [],
    };

    releaseVersions.forEach((releaseVersion) => {
      filters.release_version.push({ equals: releaseVersion });
    });

    let workers;
    let totalItems = 0;
    let allWorkers;

    if (this.can.can('list model', scope, { collection: 'workers' })) {
      workers = await this.store.query('worker', {
        scope_id,
        query: { search, filters },
        page,
        pageSize,
      });
      totalItems = workers.meta?.totalItems;
      allWorkers = await this.getAllWorkers(scope_id);
    }

    return { workers, allWorkers, totalItems };
  }

  async getAllWorkers(scope_id) {
    return await this.store.query(
      'worker',
      {
        scope_id,
        query: { filters: { scope_id: [{ equals: scope_id }] } },
      },
      { pushToStore: false },
    );
  }

  resetController(controller, isExiting) {
    // Clear selected worker when exiting route to prevent
    // the flyout from showing when returning to this route
    if (isExiting) {
      controller.setProperties({
        selectedWorker: null,
      });
    }
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
