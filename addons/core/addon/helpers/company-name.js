/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';

export default class extends Helper {
  compute() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return config.companyName;
  }
}
