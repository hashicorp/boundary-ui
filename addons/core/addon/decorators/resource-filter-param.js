import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';

/**
 *
 */
class ResourceFilter extends EmberObject {
  // =attributes

  route;
  name;
  allowedValues;
  defaultValue;

  /**
   *
   */
  get filterKey() {
    return `filter-${this.name}`;
  }

  /**
   *
   */
  get value() {
    const value =
      this.route.paramsFor(this.route.routeName)[this.filterKey] ||
      JSON.stringify(this.defaultValue);
    return value ? JSON.parse(value) : null;
  }

  /**
   *
   */
  set value(value) {
    const queryParams = {};
    queryParams[this.filterKey] = JSON.stringify(value);
    this.route.transitionTo({ queryParams });
  }

  // =static methods

  /**
   *
   */
  static setupRouteQueryParams(routeClass, name) {
    const filterKey = `filter-${name}`;

    // If the route has no query params specified yet, declare them.
    if (!Object.keys(routeClass.queryParams).length)
      routeClass.queryParams = {};

    // If the route has no resource filters list specified yet, create one.
    if (!routeClass.resourceFilterParams) routeClass.resourceFilterParams = [];

    // Add the resource filter query parameter to the route.  Resource filter
    // param changes refresh the model but do not contribute to browser history.
    // See https://guides.emberjs.com/release/routing/query-params/
    routeClass.queryParams[filterKey] = {
      refreshModel: true,
      replace: true,
    };
  }

  /**
   *
   */
  static getOrCreateRouteResourceFilter(
    routeInstance,
    name,
    allowedValues,
    defaultValue
  ) {
    const owner = getOwner(routeInstance);
    const containerKey = `route-resource-filter:${name}@${routeInstance.routeName}`;
    const factory = owner.factoryFor(containerKey);
    if (!factory) {
      // create factory
      class RouteResourceFilter extends this {
        route = routeInstance;
        name = name;
        allowedValues = allowedValues;
        defaultValue = defaultValue;
      }
      owner.register(containerKey, RouteResourceFilter);
    }
    const instance = owner.lookup(containerKey);
    return instance;
  }
}

/**
 * A resource filter param is a concise way to express a route query parameter.
 * Resource filter params abstract away a route's query parameter
 * interface, treating a query param as a simple attribute on a route instance.
 * Getting the attribute value is equivalent to looking up the associated query
 * parameter.  Setting the attribute is equivalent to transitioning to the route
 * and passing the associated query parameter value.
 *
 * Additionally, resource filter params may declare `allowedValues`, an array
 * containing the set of values the parameter may take.  While unenforced,
 * `allowedValues` are useful metadata about a resource filter and may be fetch
 * via `ResourceFilterParamHelper`.  An optional default value may be specified
 * via `defaultValue` passed to the decorator.
 *
 * @see ResourceFilterParamHelper
 *
 * @example
 *
 *   export default class MyRoute extends Route {
 *
 *     @resourceFilterParam(['active', 'pending'], ['active'])
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
export function resourceFilterParam(allowedValues, defaultValue) {
  /**
   * @param {object} target
   * @param {string} name
   * @param {object} descriptor
   * @return {object{get, set}}
   */
  return function (target, name /*, descriptor*/) {
    ResourceFilter.setupRouteQueryParams(target, name);

    let instance;

    // Override the decorated attribute with a getter and setter.
    return {
      /**
       * Returns the JSON-parsed query parameter value OR defaultValue.
       */
      get() {
        instance = ResourceFilter.getOrCreateRouteResourceFilter(
          this,
          name,
          allowedValues,
          defaultValue
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
