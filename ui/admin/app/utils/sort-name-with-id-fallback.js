/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export function sortNameWithIdFallback(recordA, recordB) {
  let a = recordA.attributes.name;
  let b = recordB.attributes.name;
  a = a ? a : recordA.id;
  b = b ? b : recordB.id;
  return String(a).localeCompare(String(b));
}
