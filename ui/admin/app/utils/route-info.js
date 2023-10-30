export function paramValueFinder(resourceName, parentInfo) {
  if (!parentInfo || parentInfo.localName === resourceName) {
    return [];
  }
  if (parentInfo.params) {
    let otherParam = Object.values(parentInfo.params);
    return [
      ...paramValueFinder(resourceName, parentInfo.parent),
      ...otherParam,
    ];
  }
  return paramValueFinder(resourceName, parentInfo.parent);
}
