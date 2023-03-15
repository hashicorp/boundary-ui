/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

/**
 * This helper returns true or false based on the state of the ember-loading
 * service's `isLoading` attribute.
 */
export default class extends Helper {
  // =services

  @service loading;

  // =methods

  /**
   * Returns true if "something" is loading according to ember-loading.
   * @return {boolean}
   */
  compute() {
    return this.loading.isLoading;
  }
}
