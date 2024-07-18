/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { resourceFilter } from 'core/decorators/resource-filter';
import sortBy from 'lodash/sortBy';

export default class ScopesScopeWorkersIndexRoute extends Route {
  // =attributes

  // This resource filter depends on the data from the list route so can't
  // live in the same model where the list is loaded as it needs to get loaded
  // first. If it's in the same file it might try to grab the model data before
  // it's loaded.
  @resourceFilter({
    allowed: (route) => {
      const allTags = route
        .modelFor('scopes.scope.workers')
        .flatMap((worker) => worker.allTags)
        .filter(Boolean);

      // Filter out duplicate tags
      return allTags.reduce((uniqueTags, currentTag) => {
        const isDuplicateTag = uniqueTags.some(
          (tag) => tag.key === currentTag.key && tag.value === currentTag.value,
        );

        if (!isDuplicateTag) {
          uniqueTags.push(currentTag);
        }
        return uniqueTags;
      }, []);
    },
    findBySerialized: ({ key: itemKey, value: itemValue }, { key, value }) =>
      itemKey === key && itemValue === value,
    refreshRouteOnChange: false,
  })
  tags;

  // =methods

  model() {
    const workers = sortBy(
      this.modelFor('scopes.scope.workers'),
      'displayName',
    );

    if (this.tags?.length) {
      // Return workers that have config and/or api tags that have at
      // least one intersection with the filter tags
      return workers.filter((worker) => {
        if (!worker.config_tags && !worker.api_tags) {
          return null;
        }

        const workerTags = worker.allTags;
        return this.tags.some((tag) =>
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

  /**
   * Clears filter selections.
   */
  @action
  clearAllFilters() {
    this.tags = [];
    this.refresh();
  }

  /**
   * Sets the specified resource filter field to the specified value.
   * @param {string} field
   * @param value
   */
  @action
  filterBy(field, value) {
    this[field] = value;
    this.refresh();
  }

  @action
  isEqual(firstTag, secondTag) {
    return firstTag.key === secondTag.key && firstTag.value === secondTag.value;
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
