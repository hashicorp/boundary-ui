import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { typeOf } from '@ember/utils';

/**
 *
 */
const isFunction = (value) => typeOf(value) === 'function';

/**
 *
 */
class ResourceFilter extends EmberObject {
  // =attributes

  route;
  name;
  defaultValue;
  allowed;
  serialize;
  deserialize;

  /**
   *
   */
  get filterKey() {
    return `filter-${this.name}`;
  }

  /**
   *
   */
  get allowedValues() {
    if (isFunction(this.allowed)) {
      return this.allowed(this.route);
    }
    return this.allowed;
  }

  /**
   *
   */
  get value() {
    const decodedValue =
      this.route.paramsFor(this.route.routeName)[this.filterKey] ||
      JSON.stringify(this.defaultValue);
    const value = decodedValue ? JSON.parse(decodedValue) : null;
    const deserializedValue = value
      ? value.map((serializedValue) =>
          this.allowedValues.find((item) =>
            this.deserializeValue(item, serializedValue)
          )
        )
      : null;
    return deserializedValue;
  }

  /**
   *
   */
  set value(value) {
    const queryParams = {};
    const serialized = value.map((value) => this.serializeValue(value));
    queryParams[this.filterKey] = JSON.stringify(serialized);
    this.route.transitionTo({ queryParams });
  }

  // =methods

  /**
   *
   */
  serializeValue(value) {
    if (this.serialize) {
      return this.serialize(...arguments);
    }
    return value;
  }

  /**
   *
   */
  deserializeValue(item, serializedValue) {
    if (this.deserialize) {
      return this.deserialize(...arguments);
    }
    return item === serializedValue;
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
    allowed,
    defaultValue,
    serialize,
    deserialize
  ) {
    const owner = getOwner(routeInstance);
    const containerKey = `route-resource-filter:${name}@${routeInstance.routeName}`;
    const factory = owner.factoryFor(containerKey);
    if (!factory) {
      // create factory
      class RouteResourceFilter extends this {
        route = routeInstance;
        name = name;
        allowed = allowed;
        defaultValue = defaultValue;
        serialize = serialize;
        deserialize = deserialize;
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
 * Additionally, resource filter params may declare `allowed`, an array
 * containing the set of values the parameter may take.  While unenforced,
 * `allowed` are useful metadata about a resource filter and may be fetch
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
export function resourceFilterParam({
  allowed,
  defaultValue,
  serialize,
  deserialize,
}) {
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
       * Returns the current value of the resource filter.
       */
      get() {
        instance = ResourceFilter.getOrCreateRouteResourceFilter(
          this,
          name,
          allowed,
          defaultValue,
          serialize,
          deserialize
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
