/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

export function initialize(owner) {
  const service = owner.lookup('service:feature-edition');
  service.initialize();
}

export default {
  initialize,
};
