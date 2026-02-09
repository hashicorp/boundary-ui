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
   * Tracks if the original app token was inactive (stale, expired, revoked)
   * when cloning was initiated.
   * @type {boolean}
   */
  @tracked originalTokenWasInactive = false;

  /**
   * Stores the ID of the original app token being cloned.
   * @type {string|null}
   */
  @tracked originalTokenId = null;

  /**
   * Stores the name of the original app token being cloned.
   * @type {string|null}
   */
  @tracked originalTokenName = null;

  /**
   * Stores the status of the original app token being cloned.
   * @type {string|null}
   */
  @tracked originalTokenStatus = null;
}
