/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Helper from '@ember/component/helper';
import { service } from '@ember/service';

/**
 * This helper returns true or false based on the state of the loading
 * service's `isLoading` attribute.
 */
export default class extends Helper {
  // =services

  @service loading;

  // =methods

  /**
   * Returns true if "something" is loading according to the loading service.
   * @return {boolean}
   */
  compute() {
    return this.loading.isLoading;
  }
}
