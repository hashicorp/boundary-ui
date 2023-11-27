/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsSessionsIndexRoute extends Route {
  // =services

  @service session;
  @service store;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
  };

  // =methods

  /**
   * Loads all sessions for the current user.
   *
   * @return {Promise{[SessionModel]}}
   */
  async model({ search = '' }) {
    const filters = {
      user_id: { equals: this.session.data.authenticated.user_id },
    };
    const queryOptions = {
      query: { search },
      filters,
    };

    return this.store.query('session', queryOptions);
  }
}
