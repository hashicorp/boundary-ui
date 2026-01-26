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
  @service intl;

  // =attributes

  queryParams = ['showCreatedAppToken'];

  @tracked showCreatedAppToken = false;

  /**
   * Returns the appropriate translation key based on the app token status.
   * @type {string}
   */
  get statusTranslation() {
    const status = this.model?.status;
    switch (status) {
      case 'stale':
        return this.intl.t(
          'resources.app-token.messages.inactive-alert.title.1',
        );
      case 'revoked':
        return this.intl.t(
          'resources.app-token.messages.inactive-alert.title.2',
        );
      case 'expired':
      default:
        return this.intl.t(
          'resources.app-token.messages.inactive-alert.title.0',
        );
    }
  }

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
