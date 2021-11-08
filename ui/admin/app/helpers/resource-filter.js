import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { observes } from '@ember-decorators/object';

/**
 * This helper returns true or false based on the state of the ember-loading
 * service's `isLoading` attribute.
 */
export default class extends Helper {
  // =services

  @service router;

  @observes('router.currentRoute')
  onQueryParamsChanged() {
    this.recompute();
  }

  // =methods

  /**
   * Returns true if "something" is loading according to ember-loading.
   * @return {boolean}
   */
  compute([routeName, filterName]) {
    const queryParamName = `filter-${filterName}`;
    const rawValue =
      this.router.currentRoute.queryParams[queryParamName];
    const currentValue = rawValue ? JSON.parse(rawValue) : null;
    return currentValue;
  }
}
