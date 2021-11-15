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
    this.router.on('routeDidChange', this.routeDidChange);
  }

  /**
   * Stop listening to route events when this helper is destroyed.
   */
  willDestroy() {
    this.router.off('routeDidChange', this.routeDidChange);
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
    console.log(routeName, name, 'route namess')
    const owner = getOwner(this);
    // Filter options
    const route = owner.lookup(`route:${routeName}`);
    const filterAllowedValuesKey = `filter-allowed-values-${name}`;
    console.log(route, filterAllowedValuesKey, 'foiltallowed values')
    const allowedValues = route[filterAllowedValuesKey];
    console.log(allowedValues, 'allowed values')

    // Selected filters
    const rawValue = route[name];
    const selectedValue = rawValue || null;
    console.log(name, allowedValues, selectedValue, 'pfcrrfe')
    return { name, allowedValues, selectedValue };
  }

  // =actions

  /**
   * Triggers a recompute (see above) when the route changes, especially when
   * route query params change.
   */
  @action
  routeDidChange() {
    this.recompute();
  }
}
