import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class RoseFilterTagsIndexComponent extends Component {
  // =services

  @service router;

  // =attributes
  get tags() {
    const tags = [];

    for (const key in this.args.tags) {
      if (Array.isArray(this.args.tags[key])) {
        const names = this.args.tags[key].map((item) => item.name);
        tags.push(...names);
      }
    }

    return tags;
  }

  // =methods

  /**
   * Clears a single filter
   * @param {string} filterName
   */
  @action
  removeFilter(filterName) {
    const matchedQueryParam = this.findQueryParamByName(filterName);
    const queryParams = { ...this.router.currentRoute.queryParams };

    for (const key in matchedQueryParam) {
      if (queryParams[key] !== undefined && matchedQueryParam[key]?.id) {
        const matchedId = matchedQueryParam[key].id;
        const paramValue = queryParams[key];

        if (typeof paramValue === 'string') {
          queryParams[key] = JSON.parse(paramValue);
        }

        if (Array.isArray(queryParams[key])) {
          queryParams[key] = queryParams[key].filter(
            (item) => item !== matchedId,
          );
        }
      }
    }

    this.router.replaceWith({ queryParams: queryParams });
  }

  @action
  clearAllFilters() {
    const allowList = ['scopes', 'availableSession', 'type'];
    const queryParams = { ...this.router.currentRoute.queryParams };

    for (const key in queryParams) {
      if (allowList.includes(key)) {
        queryParams[key] = [];
      }
    }

    this.router.replaceWith({ queryParams: queryParams });
  }

  findQueryParamByName(filterName) {
    const matchedObject = {};

    Object.entries(this.args.tags).forEach(([key, value]) => {
      const foundTag = value.find((tag) => tag.name === filterName);
      if (foundTag) {
        matchedObject[key] = foundTag;
      }
    });

    return matchedObject;
  }
}
