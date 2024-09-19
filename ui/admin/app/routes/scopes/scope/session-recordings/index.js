/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
    page: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
  };

  /**
   * Load all session recordings.
   * @return {Promise<{ totalItems: number, sessionRecordings: [SessionRecordingModel], sessionRecordingsExist: boolean, storageBucketsExist: boolean }>}
   */
  async model({ search, page, pageSize }) {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    const filters = {
      scope_id: [{ equals: scope_id }],
    };
    let sessionRecordings;
    let totalItems = 0;
    let sessionRecordingsExist = false;
    let storageBucketsExist = false;

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
      sessionRecordingsExist = await this.getSessionRecordingsExist(
        scope_id,
        totalItems,
      );
      storageBucketsExist = await this.getStorageBucketsExist(scope_id);

      return {
        sessionRecordings,
        sessionRecordingsExist,
        totalItems,
        storageBucketsExist,
      };
    }
  }

  async getSessionRecordingsExist(scope_id, totalItems) {
    if (totalItems > 0) {
      return true;
    }
    const options = { pushToStore: false, peekIndexedDB: true };
    const sessionRecording = await this.store.query(
      'session-recording',
      {
        scope_id,
        query: {
          filters: {
            scope_id: [{ equals: scope_id }],
          },
        },
        page: 1,
        pageSize: 1,
      },
      options,
    );
    return sessionRecording.length > 0;
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
      return storageBuckets.length > 0;
    } catch (e) {
      // no op
      return false;
    }
  }
}
