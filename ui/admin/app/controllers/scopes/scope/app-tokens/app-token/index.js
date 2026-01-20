/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ScopesScopeAppTokensAppTokenIndexController extends Controller {
  @controller('scopes/scope/app-tokens/index') appTokens;

  // =services

  @service router;

  // =attributes

  queryParams = ['showCreatedAppToken'];

  @tracked showCreatedAppToken = false;

  // =actions

  /**
   * Reset query param `showCreatedAppToken` to false.
   */
  @action
  async resetAppTokenModal() {
    await this.router.replaceWith({
      queryParams: { showCreatedAppToken: false },
    });
    this.router.refresh('scopes.scope.app-tokens.app-token', this.model.id);
  }
}
