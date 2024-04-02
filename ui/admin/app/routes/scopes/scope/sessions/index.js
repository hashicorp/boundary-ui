/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeSessionsIndexRoute extends Route {
  // =services

  @service store;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    users: {
      refreshModel: true,
      replace: true,
    },
    targets: {
      refreshModel: true,
      replace: true,
    },
    status: {
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

  allSessions;
  associatedUsers;
  associatedTargets;

  /**
   * Loads all sessions under the current scope and encapsulates them into
   * an array of objects containing their associated users and targets.
   * @return {Promise{[{sessions: [SessionModel], allSessions: [SessionModel], associatedUsers: [UserModel], associatedTargets: [TargetModel], totalItems: number}]}}
   */
  async model({ search, users, targets, status, page, pageSize }) {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const filters = {
      status: [],
      user_id: [],
      target_id: [],
    };
    users.forEach((user) => {
      filters.user_id.push({ equals: user });
    });
    targets.forEach((target) => {
      filters.target_id.push({ equals: target });
    });
    status.forEach((item) => {
      filters.status.push({ equals: item });
    });

    const queryOptions = {
      scope_id,
      recursive: true,
      query: { search, filters },
      page,
      pageSize,
    };

    const sessions = await this.store.query('session', queryOptions);
    const totalItems = sessions.meta?.totalItems;

    // Query all sessions, users, and targets for defining filtering values if entering route for the first time
    if (!this.allSessions) {
      await this.getAllSessions(scope_id);
    }
    if (!this.associatedUsers) {
      await this.getAssociatedUsers();
    }
    if (!this.associatedTargets) {
      await this.getAssociatedTargets(scope_id);
    }

    return {
      sessions,
      allSessions: this.allSessions,
      associatedUsers: this.associatedUsers,
      associatedTargets: this.associatedTargets,
      totalItems,
    };
  }

  /**
   * Get all the sessions but only load them once when entering the route.
   * @param scope_id
   * @returns {Promise<void>}
   */
  async getAllSessions(scope_id) {
    const allSessionsQuery = {
      scope_id,
      recursive: true,
    };
    this.allSessions = await this.store.query('session', allSessionsQuery, {
      pushToStore: false,
    });
  }

  /**
   * Get all the users but only load them once when entering the route.
   * @returns {Promise<void>}
   */
  async getAssociatedUsers() {
    const uniqueSessionUserIds = new Set(
      this.allSessions
        .filter((session) => session.user_id)
        .map((session) => session.user_id),
    );
    const filters = { id: { values: [] } };
    uniqueSessionUserIds.forEach((userId) => {
      filters.id.values.push({ equals: userId });
    });
    const associatedUsersQuery = {
      scope_id: 'global',
      recursive: true,
      query: { filters },
    };
    this.associatedUsers = await this.store.query('user', associatedUsersQuery);
  }

  /**
   * Get all the targets but only load them once when entering the route.
   * @param scope_id
   * @returns {Promise<void>}
   */
  async getAssociatedTargets(scope_id) {
    const uniqueSessionTargetIds = new Set(
      this.allSessions
        .filter((session) => session.target_id)
        .map((session) => session.target_id),
    );
    const filters = { id: { values: [] } };
    uniqueSessionTargetIds.forEach((targetId) => {
      filters.id.values.push({ equals: targetId });
    });
    const associatedTargetsQuery = {
      scope_id,
      recursive: true,
      query: { filters },
    };
    this.associatedTargets = await this.store.query(
      'target',
      associatedTargetsQuery,
    );
  }

  // =actions

  /**
   * refreshes all session route data.
   */
  @action
  async refreshAll() {
    const { id: scope_id } = this.modelFor('scopes.scope');

    await this.getAllSessions(scope_id);
    await this.getAssociatedUsers();
    await this.getAssociatedTargets(scope_id);

    return super.refresh(...arguments);
  }
}
