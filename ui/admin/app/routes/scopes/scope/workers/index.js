/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';

import sortBy from 'lodash/sortBy';

export default class ScopesScopeWorkersIndexRoute extends Route {
  // =attributes

  queryParams = {
    tags: {
      refreshModel: true,
      replace: true,
    },
  };

  // =methods

  model({ tags }) {
    const workers = sortBy(
      this.modelFor('scopes.scope.workers'),
      'displayName',
    );
    if (tags?.length) {
      // Return workers that have config and/or api tags that have at
      // least one intersection with the filter tags

      // Decode the tags from base64
      const decodedTags = tags.map((tag) => {
        const decodedString = window.atob(tag);
        return JSON.parse(decodedString);
      });

      return workers.filter((worker) => {
        if (!worker.config_tags && !worker.api_tags) {
          return null;
        }
        const workerTags = worker.allTags;
        return decodedTags.some((tag) =>
          workerTags.some(
            (workerTag) =>
              tag.key === workerTag.key && tag.value === workerTag.value,
          ),
        );
      });
    }
    return workers;
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
