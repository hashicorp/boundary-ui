/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

// Traverses through a RouteInfo object in order to find
// the dynamic segments of a route and stops traversing when
// the route name of the caller is reached. In the RouteInfo
// object the params object contains the dynamic segment of
// a particular route.

export function paramValueFinder(routeName, parentInfo) {
  if (!parentInfo?.params || parentInfo.localName === routeName) {
    return [];
  }

  let otherParam = Object.values(parentInfo.params);
  return [...paramValueFinder(routeName, parentInfo.parent), ...otherParam];
}
