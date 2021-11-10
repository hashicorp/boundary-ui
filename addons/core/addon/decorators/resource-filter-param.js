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
 *   export default class ScopesScopeAuthMethodsRoute extends Route {
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
 *       console.log(this.status);
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
    const filterKey = `filter-${name}`;
    const filterAllowedValuesKey = `filter-allowed-values-${name}`;

    // If the route has no query params specified yet, declare them.
    if (!Object.keys(target.queryParams).length) target.queryParams = {};

    // Add the resource filter query parameter to the route.  Resource filter
    // param changes refresh the model but do not contribute to browser history.
    // See https://guides.emberjs.com/release/routing/query-params/
    target.queryParams[filterKey] = {
      refreshModel: true,
      replace: true,
    };

    // Store the allowed values for future lookup
    // (via `ResourceFilterParamHelper`).
    target[filterAllowedValuesKey] = allowedValues;

    // Override the decorated attribute with a getter and setter.
    return {
      /**
       * Returns the JSON-parsed query parameter value OR defaultValue.
       */
      get() {
        const value = this._router.currentRoute.queryParams[filterKey];
        return value ? JSON.parse(value) : defaultValue || null;
      },

      /**
       * Sets the resource filter param to the stringified representation
       * of `value`.  NOTE:  this is equivalent to transitioning into the
       * current route, changing the associated query param.
       * @param value
       */
      set(value) {
        const queryParams = {};
        queryParams[filterKey] = JSON.stringify(value);
        this.transitionTo({ queryParams });
      },
    };
  };
}
