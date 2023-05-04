/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';

export default class extends Helper {
  compute() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return config.appName;
  }
}
