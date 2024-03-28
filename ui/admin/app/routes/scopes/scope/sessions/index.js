/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeSessionsIndexRoute extends Route {
  // =services

  @service store;
  @service resourceFilterStore;

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

  allUsers;
  allSessions;

  /**
   * Loads all sessions under the current scope and encapsulates them into
   * an array of objects containing their associated users and targets.
   * @return {Promise{[{sessions: [SessionModel], allSessions: [SessionModel], allUsers: [UserModel], allTargets: [TargetModel], totalItems: number}]}}
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
    if (!this.allUsers) {
      await this.getAllUsers();
    }
    if (!this.allTargets) {
      await this.getAllTargets(scope_id);
    }

    return {
      sessions,
      allSessions: this.allSessions,
      allUsers: this.allUsers,
      allTargets: this.allTargets,
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
  async getAllUsers() {
    const uniqueSessionUserIds = new Set(
      this.allSessions.map((session) => session.user_id),
    );
    const filters = { id: { logicalOperator: 'or', values: [] } };
    uniqueSessionUserIds.forEach((userId) => {
      filters.id.values.push({ equals: userId });
    });
    const allUsersQuery = {
      scope_id: 'global',
      recursive: true,
      query: { filters },
    };
    this.allUsers = await this.store.query('user', allUsersQuery);
  }

  /**
   * Get all the targets but only load them once when entering the route.
   * @param scope_id
   * @returns {Promise<void>}
   */
  async getAllTargets(scope_id) {
    const uniqueSessionTargetIds = new Set(
      this.allSessions.map((session) => session.target_id),
    );
    const filters = { id: { logicalOperator: 'or', values: [] } };
    uniqueSessionTargetIds.forEach((targetId) => {
      filters.id.values.push({ equals: targetId });
    });
    const allTargetsQuery = {
      scope_id,
      recursive: true,
      query: { filters },
    };
    this.allTargets = await this.store.query('target', allTargetsQuery);
  }

  // =actions

  /**
   * Cancels the specified session and notifies user of success or error.
   * @param {SessionModel}
   */
  @action
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.canceled-success')
  async cancelSession(session) {
    await session.cancelSession();
  }

  /**
   * refreshes all session route data.
   */
  @action
  async refreshAll() {
    const { id: scope_id } = this.modelFor('scopes.scope');

    await this.getAllSessions(scope_id);
    await this.getAllUsers();
    await this.getAllTargets(scope_id);

    return super.refresh(...arguments);
  }
}
