/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TYPE_TARGET_TCP } from 'api/models/target';

export default class OnboardingRoute extends Route {
  // =services

  @service store;
  @service session;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, or has orgs redirect to index for further processing.
   */
  async beforeModel() {
    const orgs = await this.store.query('scope', {
      scope_id: 'global',
      query: { filters: { scope_id: [{ equals: 'global' }] } },
    });
    if (!this.session.isAuthenticated || orgs.length) {
      this.router.transitionTo('index');
    }
  }

  /**
   * List all scopes (orgs) under global.
   * Create org, project, target and roles
   */
  async model() {
    return {
      org: this.store.createRecord('scope', {
        type: 'org',
        scopeID: 'global',
        name: 'SecOps',
        description: 'Sample org created by quick setup',
      }),
      project: this.store.createRecord('scope', {
        type: 'project',
        name: 'AWS',
        description: 'Sample project created by quick setup',
      }),
      target: this.store.createRecord('target', {
        type: TYPE_TARGET_TCP,
        name: 'Test target',
        description: 'Sample target created by quick setup',
      }),
      role: this.store.createRecord('role', {
        name: 'test_target_role',
      }),
    };
  }
}
