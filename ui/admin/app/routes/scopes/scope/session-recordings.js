/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import orderBy from 'lodash/orderBy';

export default class ScopesScopeSessionRecordingsRoute extends Route {
  // =services

  @service store;
  @service can;
  @service session;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Load all session recordings.
   * @return {{sessionRecordings: Array, storageBuckets: Array}}
   */
  async model() {
    let storageBuckets;

    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;

    if (
      this.can.can('list scope', scope, {
        collection: 'session-recordings',
      })
    ) {
      const sessionRecordings = await this.store.query('session-recording', {
        scope_id,
        recursive: true,
      });

      // Sort sessions by created time descending (newest on top)
      const sortedSessionRecordings = orderBy(
        sessionRecordings,
        'created_time',
        'desc',
      );

      // Storage buckets could fail for a number of reasons, including that
      // the user isn't authorized to access them.
      try {
        storageBuckets = await this.store.query('storage-bucket', {
          scope_id,
          recursive: true,
        });
      } catch (e) {
        // no op
      }

      return {
        sessionRecordings: sortedSessionRecordings,
        storageBuckets,
      };
    }
  }
}
