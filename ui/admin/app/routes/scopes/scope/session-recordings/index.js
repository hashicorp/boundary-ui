/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import {
  STATE_SESSION_RECORDING_STARTED,
  STATE_SESSION_RECORDING_AVAILABLE,
  STATE_SESSION_RECORDING_UNKNOWN,
} from 'api/models/session-recording';

export default class ScopesScopeSessionRecordingsIndexRoute extends Route {
  // =services
  @service store;
  @service router;
  @service can;
  @service intl;

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
    sortAttribute: {
      refreshModel: true,
      replace: true,
    },
    sortDirection: {
      refreshModel: true,
      replace: true,
    },
  };

  /**
   * Load all session recordings.
   * @return {Promise<{ totalItems: number, sessionRecordings: [SessionRecordingModel], doSessionRecordingsExist: boolean, doStorageBucketsExist: boolean }>}
   */
  async model(params) {
    const useDebounce =
      this.retrieveData?.lastPerformed?.args?.[0].search !== params.search;
    return this.retrieveData.perform({ ...params, useDebounce });
  }

  retrieveData = restartableTask(
    async ({
      search,
      time,
      users,
      scopes,
      targets,
      page,
      pageSize,
      sortAttribute,
      sortDirection,
      useDebounce,
    }) => {
      if (useDebounce) {
        await timeout(250);
      }

      const scope = this.modelFor('scopes.scope');
      const { id: scope_id } = scope;
      let sessionRecordings;
      let totalItems = 0;
      let doSessionRecordingsExist = false;
      let doStorageBucketsExist = false;
      const filters = {
        created_time: [],
        user_id: [],
        target_scope_id: [],
        target_id: [],
      };
      if (time) filters.created_time.push({ gte: new Date(time) });
      users.forEach((user) => {
        filters['user_id'].push({ equals: user });
      });
      scopes.forEach((scope) => {
        filters['target_scope_id'].push({ equals: scope });
      });
      targets.forEach((target) => {
        filters['target_id'].push({ equals: target });
      });

      const stateMap = {
        [STATE_SESSION_RECORDING_AVAILABLE]: this.intl.t('states.completed'),
        [STATE_SESSION_RECORDING_STARTED]: this.intl.t('states.recording'),
        [STATE_SESSION_RECORDING_UNKNOWN]: this.intl.t('states.failed'),
      };

      const sort =
        sortAttribute === 'state'
          ? {
              attributes: [sortAttribute],
              customSort: { attributeMap: stateMap },
              direction: sortDirection,
            }
          : { attributes: [sortAttribute], direction: sortDirection };

      if (
        this.can.can('list scope', scope, {
          collection: 'session-recordings',
        })
      ) {
        const queryOptions = {
          scope_id,
          recursive: true,
          query: { search, filters, sort },
          page,
          pageSize,
        };

        sessionRecordings = await this.store.query(
          'session-recording',
          queryOptions,
        );
        totalItems = sessionRecordings.meta?.totalItems;
        doSessionRecordingsExist = await this.getDoSessionRecordingsExist(
          scope_id,
          totalItems,
        );
        doStorageBucketsExist = await this.getDoStorageBucketsExist(scope_id);

        return {
          sessionRecordings,
          doSessionRecordingsExist: doSessionRecordingsExist,
          totalItems,
          doStorageBucketsExist: doStorageBucketsExist,
        };
      }
    },
  );

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
    const options = { pushToStore: false, peekDb: true };
    const sessionRecordings = await this.store.query(
      'session-recording',
      {
        scope_id,
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
   * Loads initial filter options in controller so it happens outside of model hook
   * @param controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    controller.loadItems.perform();
  }
}
