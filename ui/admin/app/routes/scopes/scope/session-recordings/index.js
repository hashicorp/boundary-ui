/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeSessionRecordingsIndexRoute extends Route {
  // =services
  @service store;
  @service router;
  @service can;

  // =attributes

  queryParams = {
    search: {
      refreshModel: true,
      replace: true,
    },
    time: {
      refreshModel: true,
      replace: true,
    },
    users: {
      refreshModel: true,
      replace: true,
    },
    scopes: {
      refreshModel: true,
      replace: true,
    },
    targets: {
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

  allSessionRecordings;

  /**
   * Load all session recordings.
   * @return {Promise<{ totalItems: number, sessionRecordings: [SessionRecordingModel], doSessionRecordingsExist: boolean, doStorageBucketsExist: boolean }>}
   */
  async model({ search, time, users, scopes, targets, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    let sessionRecordings;
    let totalItems = 0;
    let doSessionRecordingsExist = false;
    let doStorageBucketsExist = false;
    const filters = {
      created_time: [],
      'create_time_values.user.id': [],
      'create_time_values.target.scope.id': [],
      'create_time_values.target.id': [],
    };
    if (time) filters.created_time.push({ gte: new Date(time) });
    users.forEach((user) => {
      filters['create_time_values.user.id'].push({ equals: user });
    });
    scopes.forEach((scope) => {
      filters['create_time_values.target.scope.id'].push({ equals: scope });
    });
    targets.forEach((target) => {
      filters['create_time_values.target.id'].push({ equals: target });
    });

    if (
      this.can.can('list scope', scope, {
        collection: 'session-recordings',
      })
    ) {
      const queryOptions = {
        scope_id,
        recursive: true,
        query: { search, filters },
        page,
        pageSize,
      };

      sessionRecordings = await this.store.query(
        'session-recording',
        queryOptions,
      );
      totalItems = sessionRecordings.meta?.totalItems;
      // Query all session recordings for filtering values if entering route for the first time
      if (!this.allSessionRecordings) {
        await this.getAllSessionRecordings(scope_id);
      }
      doSessionRecordingsExist = await this.getDoSessionRecordingsExist(
        scope_id,
        totalItems,
      );
      doStorageBucketsExist = await this.getDoStorageBucketsExist(scope_id);

      return {
        sessionRecordings,
        doSessionRecordingsExist: doSessionRecordingsExist,
        allSessionRecordings: this.allSessionRecordings,
        totalItems,
        doStorageBucketsExist: doStorageBucketsExist,
      };
    }
  }

  /**
   * Sets allSessionRecordings to all session recordings for filters
   * @param {string} scope_id
   */
  async getAllSessionRecordings(scope_id) {
    const options = { pushToStore: false, peekIndexedDB: true };
    this.allSessionRecordings = await this.store.query(
      'session-recording',
      {
        scope_id,
        recursive: true,
      },
      options,
    );
  }

  /**
   * Sets doSessionRecordingsExist to true if there are any session recordings.
   * @param {string} scope_id
   * @param {number} totalItems
   * @returns {Promise<boolean>}
   */
  async getDoSessionRecordingsExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekIndexedDB: true };
    const sessionRecordings = await this.store.query(
      'session-recording',
      {
        scope_id,
        query: { filters: { scope_id: [{ equals: scope_id }] } },
        page: 1,
        pageSize: 1,
        recursive: true,
      },
      options,
    );
    return sessionRecordings.length > 0;
  }

  /**
   * Returns true if any storage buckets exist.
   * @param {string} scope_id
   * @returns {Promise<boolean>}
   */
  async getDoStorageBucketsExist(scope_id) {
    // Storage buckets could fail for a number of reasons, including that
    // the user isn't authorized to access them.
    try {
      const storageBuckets = await this.store.query('storage-bucket', {
        scope_id,
        recursive: true,
      });
      return Boolean(storageBuckets.length);
    } catch (e) {
      // no op
      return false;
    }
  }

  // =actions

  /**
   * refreshes all session recording route data.
   */
  @action
  async refreshAll() {
    const scope = this.modelFor('scopes.scope');

    await this.getAllSessionRecordings(scope.id);

    return super.refresh(...arguments);
  }
}
