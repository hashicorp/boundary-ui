/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { helper } from '@ember/component/helper';

export default helper(function isTagChecked([checkedItems, item]) {
  if (!Array.isArray(checkedItems) || !item.key || !item.value) {
    return false;
  }
  return checkedItems.some((i) => i.key === item.key && i.value === item.value);
});
