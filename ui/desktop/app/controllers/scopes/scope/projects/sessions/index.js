/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { loading } from 'core/decorators/loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import orderBy from 'lodash/orderBy';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
  STATUS_SESSION_CANCELING,
  statusTypes,
} from 'api/models/session';

export default class ScopesScopeProjectsSessionsIndexController extends Controller {
  // =services

  @service intl;
  @service store;
  @service ipc;
  @service session;
  @service router;
  @service can;

  // =attributes

  queryParams = [
    { targets: { type: 'array' } },
    { status: { type: 'array' } },
    { scopes: { type: 'array' } },
    'page',
    'pageSize',
  ];

  @tracked targets = [];
  @tracked status = [
    STATUS_SESSION_ACTIVE,
    STATUS_SESSION_PENDING,
    STATUS_SESSION_CANCELING,
  ];
  @tracked scopes = [];
  @tracked page = 1;
  @tracked pageSize = 10;

  // =methods

  /**
   * A list of sessions sorted by created time then sorted by availability
   * @type {[SessionModel]}
   */
  get sortedSessions() {
    return orderBy(
      this.model.sessions,
      ['isAvailable', 'created_time'],
      ['desc', 'desc'],
    );
  }

  /**
   * Returns all status types for sessions
   * @returns {[object]}
   */
  get sessionStatusOptions() {
    return statusTypes.map((status) => ({
      id: status,
      name: this.intl.t(`resources.session.status.${status}`),
    }));
  }

  /**
   * Returns scopes that are associated with all sessions the user has access to
   * @returns {[ScopeModel]}
   */
  get availableScopes() {
    const uniqueSessionScopeIds = new Set(
      this.model.allSessions.map((session) => session.scope.id),
    );
    return this.model.projects.filter((project) =>
      uniqueSessionScopeIds.has(project.id),
    );
  }

  /**
   * Returns object of filters to be used for displaying selected filters
   * @returns {object}
   */
  get filters() {
    return {
      allFilters: {
        targets: this.model.associatedTargets,
        status: this.sessionStatusOptions,
        scopes: this.availableScopes,
      },
      selectedFilters: {
        targets: this.targets,
        status: this.status,
        scopes: this.scopes,
      },
    };
  }

  /**
   * Sets the query params to value of selectedItems
   * to trigger a query and closes the dropdown
   * @param {string} filter
   * @param {object} selectedItems
   */
  @action
  applyFilter(filter, selectedItems) {
    this[filter] = [...selectedItems];
    this.page = 1;
  }

  // =actions

  /**
   * Cancels the specified session and notifies user of success or error.
   * @param {SessionModel}
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.canceled-success')
  async cancelSession(session) {
    let updatedSession = session;
    // fetch session from API to verify we have most up to date record
    if (this.can.can('read session', session)) {
      updatedSession = await this.store.findRecord('session', session.id, {
        reload: true,
      });
    }

    await updatedSession.cancelSession();

    await this.ipc.invoke('stop', { session_id: session.id });
    if (
      this.router.currentRoute.name ===
      'scopes.scope.projects.sessions.session.index'
    ) {
      this.router.replaceWith('scopes.scope.projects.targets.index');
    }
  }

  /**
   * Refreshes the all data for the current page.
   */
  @action
  async refresh() {
    await this.currentRoute.refreshAll();
  }
}
