import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

/**
 * This helper returns true or false based on the state of the ember-loading
 * service's `isLoading` attribute.
 */
export default class extends Helper {
  // =services

  @service router;

  // =methods

  // =lifecycle management methods

  init() {
    super.init(...arguments);
    this.router.on('routeWillChange', this.routeWillChange);
  }

  willDestroy() {
    this.router.off('routeWillChange', this.routeWillChange);
    super.willDestroy();
  }

  // =compute method

  /**
   * Returns true if "something" is loading according to ember-loading.
   * @return {boolean}
   */
  compute([routeName, filterName]) {
    const owner = getOwner(this);
    // Filter options
    const route = owner.lookup(`route:${routeName}`);
    const filterOptionsName = `filter-options-${filterName}`;
    const items = route[filterOptionsName];
    // Selected filters
    const queryParamName = `filter-${filterName}`;
    const rawValue = this.router.currentRoute.queryParams[queryParamName];
    const selectedItems = rawValue ? JSON.parse(rawValue) : [];
    return { items, selectedItems };
  }

  // =actions

  @action
  routeWillChange() {
    this.recompute();
  }
}
