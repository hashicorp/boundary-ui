/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeGroupsIndexRoute extends Route {
  // =services

  @service store;
  @service can;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    page: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Load all groups under current scope
   * @return {{ groups: [GroupModel], totalItems: number }}
   */
  async model({ search, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    let groups = [];
    let totalItems = 0;
    if (this.can.can('list model', scope, { collection: 'groups' })) {
      groups = await this.store.query('group', {
        scope_id,
        query: { search },
        page,
        pageSize,
      });
      totalItems = groups.meta?.totalItems;
    }
    return { groups, totalItems };
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
