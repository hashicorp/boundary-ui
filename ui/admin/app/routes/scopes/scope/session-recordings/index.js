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
    users: {
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
   * @return {Promise<{ totalItems: number, sessionRecordings: [SessionRecordingModel], sessionRecordingsExist: boolean, storageBucketsExist: boolean }>}
   */
  async model({ search, users, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    let sessionRecordings;
    let totalItems = 0;
    let sessionRecordingsExist = false;
    let storageBucketsExist = false;
    const filters = {
      scope_id: [{ equals: scope_id }],
      'create_time_values.user.id': [],
    };
    users.forEach((user) => {
      filters['create_time_values.user.id'].push({ equals: user });
    });

    if (
      this.can.can('list scope', scope, {
        collection: 'session-recordings',
      })
    ) {
      const queryOptions = {
        scope_id,
        query: { search, filters },
        page,
        pageSize,
      };

      sessionRecordings = await this.store.query(
        'session-recording',
        queryOptions,
      );
      totalItems = sessionRecordings.meta?.totalItems;
      // Query all session reocordings for filtering values if entering route for the first time
      if (!this.allSessionRecordings) {
        await this.getAllSessionRecordings(scope_id);
      }
      sessionRecordingsExist = !!this.allSessionRecordings.length;

      storageBucketsExist = await this.getStorageBucketsExist(scope_id);

      return {
        sessionRecordings,
        sessionRecordingsExist,
        allSessionRecordings: this.allSessionRecordings,
        totalItems,
        storageBucketsExist,
      };
    }
  }

  async getAllSessionRecordings(scope_id) {
    const options = { pushToStore: false, peekIndexedDB: true };
    this.allSessionRecordings = await this.store.query(
      'session-recording',
      {
        query: {
          filters: {
            scope_id: [{ equals: scope_id }],
          },
        },
      },
      options,
    );
  }

  /**
   * Returns true if any storage buckets exist.
   * @param {string} scope_id
   * @returns {Promise<boolean>}
   */
  async getStorageBucketsExist(scope_id) {
    // Storage buckets could fail for a number of reasons, including that
    // the user isn't authorized to access them.
    try {
      const storageBuckets = await this.store.query('storage-bucket', {
        scope_id,
        recursive: true,
      });
      return !!storageBuckets.length;
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
