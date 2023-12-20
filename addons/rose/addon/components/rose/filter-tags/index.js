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
   * Clears a single filter from queryParams for current route
   * @param {string} filterName
   */
  @action
  removeFilter(filterName) {
    const matchedTag = this.findTagByName(filterName);
    const queryParams = { ...this.router.currentRoute.queryParams };

    for (const key in queryParams) {
      const paramValue = queryParams[key];

      if (typeof paramValue === 'string') {
        queryParams[key] = JSON.parse(paramValue);
      }
    }

    for (const key in matchedTag) {
      if (queryParams[key] !== undefined && matchedTag[key]?.id) {
        const matchedId = matchedTag[key].id;

        if (Array.isArray(queryParams[key])) {
          queryParams[key] = queryParams[key].filter(
            (item) => item !== matchedId,
          );
        }
      }
    }

    this.router.replaceWith({ queryParams });
  }

  /**
   * Clears all filters based on queryParams from tags keys
   */
  @action
  clearAllFilters() {
    const allowList = Object.keys(this.args.tags);

    const queryParams = { ...this.router.currentRoute.queryParams };

    for (const key in queryParams) {
      if (allowList.includes(key)) {
        queryParams[key] = [];
      }
    }

    this.router.replaceWith({ queryParams });
  }

  findTagByName(filterName) {
    const matchedTag = {};

    Object.entries(this.args.tags).forEach(([key, value]) => {
      const foundTag = value.find((tag) => tag.name === filterName);
      if (foundTag) {
        matchedTag[key] = foundTag;
      }
    });

    return matchedTag;
  }
}
