/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { createServer } from 'miragejs';

export default function (config) {
  return createServer({ ...config });
}
