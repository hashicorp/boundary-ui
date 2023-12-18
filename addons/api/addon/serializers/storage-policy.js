/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';

export default class StoragePolicySerializer extends ApplicationSerializer {
  // =methods

  /**
   * @return {object}
   */
  serialize() {
    return super.serialize(...arguments);
  }
}
