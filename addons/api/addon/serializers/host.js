/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';

export default class HostSerializer extends ApplicationSerializer {
  // =properties

  /**
   * @type {boolean}
   */
  serializeScopeID = false;
}
