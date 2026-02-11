/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ScopesScopeAppTokensNewController extends Controller {
  @controller('scopes/scope/app-tokens/index') appTokens;

  // =attributes

  queryParams = ['cloneAppToken'];

  /**
   * Stores the original app token model being cloned.
   * Used to access id, name, status, and isActive properties.
   * @type {AppTokenModel|null}
   */
  @tracked originalToken = null;
}
