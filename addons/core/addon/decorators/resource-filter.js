/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { typeOf } from '@ember/utils';

/**
 * @param value
 * @return {boolean} true if `value` is a function
 */
const isFunction = (value) => typeOf(value) === 'function';

/**
 * Represents a filter on a specific route and maintains filter state.
 * @class
 */
class RouteResourceFilter extends EmberObject {
  // =attributes

  route;
  name;
  defaultValue;
  allowed;
  serialize;
  findBySerialized;

  // =computed

  /**
   * Query parameter name where the selected value(s) for this filter are
   * stored in the URL.
   * @type {string}
   */
  get filterKey() {
    return `filter-${this.name}`;
  }

  /**
   * The allowed values for this filter.  See `allowed`.
   * @type {?array}
   */
  get allowedValues() {
    if (isFunction(this.allowed)) {
      return this.allowed(this.route);
    }
    return this.allowed;
  }

  get router() {
    const owner = getOwner(this.route);
    return owner.lookup('service:router');
  }

  /**
   * Currently selected value(s) for this filter, deserialized from the value of
   * the associated route query parameter.
   * @type {?array}
   */
  get value() {
    const decodedValue =
      this.route.paramsFor(this.route.routeName)[this.filterKey] ||
      JSON.stringify(this.defaultValue);
    const value = decodedValue ? JSON.parse(decodedValue) : null;
    const deserializedValue = value
      ? value
          .map((serializedValue) =>
            this.allowedValues.find((item) =>
              this.deserializeValue(item, serializedValue),
            ),
          )
          .filter((value) => value !== undefined)
      : null;

    return deserializedValue;
  }
  set value(value) {
    const queryParams = {};
    const serialized = value.map((value) => this.serializeValue(value));
    queryParams[this.filterKey] = JSON.stringify(serialized);
    this.router.transitionTo(this.route.routeName, { queryParams });
  }

  // =methods

  /**
   * Calls `serialize` (if set) on the passed value.  Otherwise returns the
   * value unaltered.
   */
  serializeValue(value) {
    if (this.serialize) {
      return this.serialize(...arguments);
    }
    return value;
  }

  /**
   * Tests if `item` is represented by `serializedValue` when deserializing
   * items from the query string.  If `findBySerialized` is unspecified,
   * a simple equality test is used.
   * @param item
   * @param {string} serializedValue
   * @return {boolean} item is represented by `serializedValue`
   */
  deserializeValue(item, serializedValue) {
    if (this.findBySerialized) {
      return this.findBySerialized(...arguments);
    }
    return item === serializedValue;
  }

  // =static methods

  /**
   * Configures the specified route with a query parameter of `name` that, when
   * changed, refreshes the route model and replaces history (rather than
   * advancing history).
   * @static
   * @param {Route} routeClass
   * @param {string} name
   * @param {boolean} refreshRouteOnChange - set to false if you plan to
   *        transition from a sibling to this route, which is currently
   *        buggy in Ember.  When set to false, you must manually refresh
   *        the route as necessary.
   */
  static setupRouteQueryParams(routeClass, name, refreshRouteOnChange = true) {
    const filterKey = `filter-${name}`;

    // If the route has no query params specified yet, declare them.
    if (!Object.keys(routeClass.queryParams).length) {
      routeClass.queryParams = {};
    }

    // If the route has no resource filters list specified yet, create one.
    if (!routeClass.resourceFilterParams) routeClass.resourceFilterParams = [];

    // Add the resource filter query parameter to the route.  Resource filter
    // param changes refresh the model but do not contribute to browser history.
    // See https://guides.emberjs.com/release/routing/query-params/
    routeClass.queryParams[filterKey] = {
      refreshModel: refreshRouteOnChange,
      replace: true,
    };
  }

  /**
   * Factory method to instantiate an instance of this class.
   * @static
   * @param {Route} routeInstance
   * @param {string} name
   * @param {array|function} allowed
   * @param {?array} defaultValue
   * @param {?function} serialize
   * @param {?function} findBySerialized
   * @return {RouteResourceFilter}
   */
  static getOrCreateRouteResourceFilter(
    routeInstance,
    name,
    allowed,
    defaultValue,
    serialize,
    findBySerialized,
  ) {
    const owner = getOwner(routeInstance);
    const containerKey = `resource-filter:${name}@${routeInstance.routeName}`;
    const factory = owner.factoryFor(containerKey);
    if (!factory) {
      // create factory
      class AppliedRouteResourceFilter extends this {
        route = routeInstance;
        name = name;
        allowed = allowed;
        defaultValue = defaultValue;
        serialize = serialize;
        findBySerialized = findBySerialized;
      }
      owner.register(containerKey, AppliedRouteResourceFilter);
    }
    const instance = owner.lookup(containerKey);
    return instance;
  }
}

/**
 * This decorator provides a concise way to express a route resource filter.
 * Resource filter params abstract away a route's query parameter
 * interface, treating a query param as just an attribute on a route instance.
 * Getting the attribute value is equivalent to looking up the associated query
 * parameter.  Setting the attribute is equivalent to transitioning to the route
 * and passing the associated query parameter value.
 *
 * Additionally, resource filter params may declare `allowed`, an array
 * (or function returning an array) containing the set of values the parameter
 * may take.  While unenforced, `allowed` are useful metadata about a resource
 * filter and may be fetch via `ResourceFilterParamHelper`.  An optional default
 * value may be specified via `defaultValue` passed to the decorator.
 *
 * @see ResourceFilterParamHelper
 *
 * @example
 *
 *   export default class MyRoute extends Route {
 *
 *     @resourceFilter({
 *       allowed: ['active', 'pending'],
 *       defaultvalue: ['active'],         // optional
 *     })
 *     status;
 *
 *     @action
 *     changeStatus(status) {
 *       // Sets query param `filter-status` on the current route, which occurs
 *       // via a route transition.
 *       this.status = status;
 *       // Log the value of query param `filter-status`.
 *       log(this.status);
 *     }
 *   }
 *
 */
export function resourceFilter({
  allowed,
  defaultValue,
  serialize,
  findBySerialized,
  refreshRouteOnChange,
}) {
  /**
   * @param {object} target
   * @param {string} name
   * @param {object} descriptor
   * @return {object{get, set}}
   */
  return function (target, name /*, descriptor*/) {
    RouteResourceFilter.setupRouteQueryParams(
      target,
      name,
      refreshRouteOnChange,
    );

    let instance;

    // Override the decorated attribute with a getter and setter.
    return {
      /**
       * Returns the current value of the resource filter.
       */
      get() {
        instance = RouteResourceFilter.getOrCreateRouteResourceFilter(
          this,
          name,
          allowed,
          defaultValue,
          serialize,
          findBySerialized,
        );
        return instance.value;
      },

      /**
       * Sets the resource filter param to the stringified representation
       * of `value`.  NOTE:  this is equivalent to transitioning into the
       * current route, changing the associated query param.
       * @param value
       */
      set(value) {
        instance.value = value;
      },
    };
  };
}

export default resourceFilter;
