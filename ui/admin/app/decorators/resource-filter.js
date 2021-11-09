export function resourceFilter(allowedValues) {
  return function (target, name, descriptor) {
    // Set queryParams to a new POJO if it has no existing members,
    // otherwise we might affect the prototype.
    if (!Object.keys(target.queryParams).length) target.queryParams = {};
    const filterName = `filter-${name}`;
    const filterOptionsName = `filter-options-${name}`;
    target.queryParams[filterName] = {
      refreshModel: true,
      replace: true,
    };
    target[filterOptionsName] = allowedValues;
    return {
      get() {
        const value = this.currentRoute.queryParams[filterName];
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        const queryParams = {};
        queryParams[filterName] = JSON.stringify(value);
        this.transitionTo({ queryParams });
      },
    };
  };
}
