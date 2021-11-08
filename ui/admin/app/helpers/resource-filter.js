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

  @observes('router._router.currentRoute')
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
    const currentValue = JSON.parse(
      this.router._router.currentRoute.queryParams[queryParamName]
    );
    return currentValue;
  }
}
