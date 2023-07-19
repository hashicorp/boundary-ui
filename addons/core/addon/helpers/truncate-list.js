/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';

/**
 * This helper truncates the list with more than 3 items
 * and returns the original list with +N remaining items
 */

export default helper(function truncateList(params /*, hash*/) {
  const list = params?.[0];
  if (list) {
    const numberOfItems = Object.keys(list).length;
    const items = list.map(({ value }) => value);

    if (numberOfItems > 3) {
      const remainingItems = items.splice(3).length;
      return items.join(', ') + `, +${remainingItems} more`;
    } else {
      return items.join(', ');
    }
  }
});
