/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { TrackedObject } from 'tracked-built-ins';
import { GRANT_SCOPE_CHILDREN } from 'api/models/role';
import { TYPE_SCOPE_PROJECT } from 'api/models/scope';

export default class ScopesScopeAppTokensNewRoute extends Route {
  // =services

  @service can;
  @service router;
  @service store;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    parentScopes: {
      refreshModel: true,
      replace: true,
    },
    page: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
    showSelectedOnly: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Redirect to parent route when scope does not have create authorized action.
   */
  beforeModel() {
    const scopeModel = this.modelFor('scopes.scope');
    if (
      this.can.cannot('create model', scopeModel, { collection: 'app-tokens' })
    ) {
      this.router.replaceWith('scopes.scope.app-tokens');
    }
  }

  /**
   * Loads all scopes and creates new app-token record.
   * @returns {Promise<{appToken: AppTokenModel, permission: object, scopes: [ScopeModel], totalItems: number}>}
   */
  async model(params) {
    const scopeModel = this.modelFor('scopes.scope');
    let record, permission;
    if (this.currentModel?.appToken?.isNew) {
      record = this.currentModel.appToken;
      permission = this.currentModel.permission;
    } else {
      record = this.store.createRecord('app-token');
      record.scopeModel = scopeModel;
      permission = new TrackedObject({ grant_scope_id: [] });
    }

    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({
      ...params,
      appToken: record,
      permission,
      useDebounce,
    });
  }

  retrieveData = restartableTask(
    async ({
      search,
      parentScopes,
      page,
      pageSize,
      showSelectedOnly,
      appToken,
      permission,
      useDebounce,
    }) => {
      if (useDebounce) {
        await timeout(250);
      }

      let filters;
      if (appToken.scope.isGlobal) {
        // Global level filters
        const canSelectOrgs =
          !permission?.grant_scope_id.includes(GRANT_SCOPE_CHILDREN);
        if (canSelectOrgs) {
          filters = { scope_id: [] };
        } else {
          filters = { type: [{ equals: TYPE_SCOPE_PROJECT }], scope_id: [] };
        }
        parentScopes.forEach((org) => {
          filters.scope_id.push({ equals: org });
        });
      } else {
        // Org level filters
        filters = { scope_id: [{ equals: appToken.scopeID }] };
      }

      if (showSelectedOnly) {
        filters.id = [];
        permission?.grant_scope_id.forEach((scope) => {
          if (scope.startsWith('p_') || scope.startsWith('o_')) {
            filters.id.push({ equals: scope });
          }
        });
      }

      const sort = { attributes: ['type'], direction: 'asc' };
      const scopes = await this.store.query('scope', {
        scope_id: 'global',
        query: { search, filters, sort },
        page,
        pageSize,
        recursive: true,
      });

      const totalItems = scopes.meta?.totalItems;

      return { appToken, permission: permission, scopes, totalItems };
    },
  );

  /**
   * Loads initial filter options in controller so it happens outside of model hook.
   * @param controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    controller.loadItems.perform();
  }
}
