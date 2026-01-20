/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';

export default class extends Helper {
  compute(params) {
    const config = getOwner(this).resolveRegistration('config:environment');
    const baseURL = config.documentation.baseURL;
    const docKey = params[0] || '';
    const configuredPath = config.documentation.topics[docKey];
    if (docKey) {
      assert(
        `
        Documentation for "${docKey}" could not be found. Please ensure that
        this key exists under "documentation" in your app config.
      `,
        configuredPath,
      );
    }
    const path = configuredPath || '';
    return path.startsWith('https') ? path : `${baseURL}${path}`;
  }
}
