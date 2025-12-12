/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAppTokensAppTokenRoute extends Route {
  @service store;

  async model(params) {
    // Fetch the app-token details using the token id and scope id
    return this.store.findRecord('app-token', params.token_id, {
      reload: true,
      adapterOptions: { scope_id: params.scope_id },
    });
  }
}
