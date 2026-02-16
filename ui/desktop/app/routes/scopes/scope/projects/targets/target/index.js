/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';

export default class ScopesScopeProjectsTargetsTargetIndexRoute extends Route {
  // =attributes

  queryParams = {
    page: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
  };

  model() {
    return this.modelFor('scopes.scope.projects.targets.target');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('search', '');
      controller.set('page', 1);
    }
  }
}
