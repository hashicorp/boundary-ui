/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ScopesScopeAppTokensAppTokenIndexController extends Controller {
  queryParams = ['showCreatedAppToken'];

  @tracked showCreatedAppToken = false;

  @service router;

  @action
  async resetAppTokenModal() {
    await this.router.replaceWith({
      queryParams: { showCreatedAppToken: false },
    });
    this.router.refresh('scopes.scope.app-tokens.app-token', this.model.id);
  }
}
