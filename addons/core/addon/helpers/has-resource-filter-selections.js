/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

/**
 * Use this helper to determine if a resource filter for a route has any
 * currently selected value.
 *
 * @see resourceFilterParam (decorator)
 *
 * @example
 *
 *   {{#if (has-resource-filter-selections 'route.name' 'field')}}
 *     Field has filter selections.
 *   {{/if}}
 */
export default class HasRouteResourceFilterSelectionsHelper extends Helper {
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
   * Returns true if the specified route has a value set for
   * any resource filter passed into the helper.
   * @param {string} routeName
   * @param {string[]} names - names of resource filter fields
   * @return {boolean}
   */
  compute([routeName, ...names]) {
    const owner = getOwner(this);
    const route = owner.lookup(`route:${routeName}`);
    const selectedValues = names.map((name) => route[name] || null).flat();
    const anyTruthy = selectedValues.reduce(
      (previousValue, currentValue) => previousValue || currentValue,
      false,
    );
    return Boolean(anyTruthy);
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
