import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

/**
 * Use this helper to fetch the current value of a resource filter param,
 * as well as its allowedValues.
 *
 * @see resourceFilterParam (decorator)
 *
 * @example
 *
 *   {{#with resource-filter-param 'status' as |param|}}
 *     {{param.name}} / {{param.value}} / {{param.selectedValue}}
 *   {{/with}}
 */
export default class ResourceFilterParamHelper extends Helper {
  // =services

  @service router;

  // =methods

  // =lifecycle management methods

  /**
   * Recompute this helper when the route changes.
   */
  constructor() {
    super(...arguments);
    this.router.on('routeWillChange', this.routeWillChange);
  }

  /**
   * Stop listening to route events when this helper is destroyed.
   */
  willDestroy() {
    this.router.off('routeWillChange', this.routeWillChange);
    super.willDestroy();
  }

  // =compute method

  /**
   * Returns an object containing `name`, `value`, and `selectedValue`.
   * `name` - The name of the resource filter param.
   * `value` - The value of the resource filter param
   * @return {object}
   */
  compute([routeName, name]) {
    const owner = getOwner(this);
    // Filter options
    const route = owner.lookup(`route:${routeName}`);
    const filterOptionsName = `filter-options-${name}`;
    const value = route[filterOptionsName];
    // Selected filters
    const rawValue = route[name];
    const selectedValue = rawValue ? JSON.parse(rawValue) : null;
    return { name, value, selectedValue };
  }

  // =actions

  /**
   * Triggers a recompute (see above) when the route changes, especially when
   * route query params change.
   */
  @action
  routeWillChange() {
    this.recompute();
  }
}
