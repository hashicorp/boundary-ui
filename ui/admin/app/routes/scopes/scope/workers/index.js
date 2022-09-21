import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { resourceFilter } from 'core/decorators/resource-filter';

export default class ScopesScopeWorkersIndexRoute extends Route {
  // =attributes

  // This resource filter depends on the data from the list route so can't
  // live in the same model where the list is loaded as it needs to get loaded
  // first. If it's in the same file it might try to grab the model data before
  // it's loaded.
  @resourceFilter({
    allowed: (route) => {
      const configTags = route
        .modelFor('scopes.scope.workers')
        .toArray()
        .flatMap((worker) => worker.getConfigTagList())
        .filter(Boolean);

      // Filter out duplicate tags
      return configTags.reduce((uniqueConfigTags, currentTag) => {
        const isDuplicateTag = uniqueConfigTags.some(
          (tag) => tag.key === currentTag.key && tag.value === currentTag.value
        );

        if (!isDuplicateTag) {
          uniqueConfigTags.push(currentTag);
        }
        return uniqueConfigTags;
      }, []);
    },
    findBySerialized: ({ key: itemKey, value: itemValue }, { key, value }) =>
      itemKey === key && itemValue === value,
    refreshRouteOnChange: false,
  })
  tags;

  // =methods

  model() {
    const workers = this.modelFor('scopes.scope.workers');

    if (this.tags?.length) {
      // Return workers that have config tags that have at
      // least one intersection with the filter tags
      return workers.filter((worker) => {
        if (!worker.config_tags) {
          return null;
        }

        const workerTags = worker.getConfigTagList();
        return this.tags.some((tag) =>
          workerTags.some(
            (workerTag) =>
              tag.key === workerTag.key && tag.value === workerTag.value
          )
        );
      });
    }
    return workers.sortBy('displayName');
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
