/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { tracked } from '@glimmer/tracking';

export default class Tag {
  @tracked key;
  @tracked value;

  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}
