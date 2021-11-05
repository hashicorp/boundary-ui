export function resourceFilter(filterName, allowedValues) {
  return function (target, name, descriptor) {
    // Set queryParams to a new POJO if it has no existing members,
    // otherwise we might affect the prototype.
    if (!Object.keys(target.queryParams).length) target.queryParams = {};
    const filterName = `filter-${name}`;
    target.queryParams[filterName] = {
      refreshModel: true,
      replace: true,
    };
    return descriptor;
  };
}
