/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { tracked } from '@glimmer/tracking';
import { debounce } from 'core/decorators/debounce';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import orderBy from 'lodash/orderBy';

export default class ScopesScopeProjectsTargetsIndexController extends Controller {
  // =services

  @service confirm;
  @service ipc;
  @service router;
  @service session;
  @service store;
  @service can;
  @service intl;

  // =attributes

  queryParams = [
    'search',
    { scopes: { type: 'array' } },
    { availableSessions: { type: 'array' } },
    'page',
    'pageSize',
  ];

  @tracked search;
  @tracked scopes = [];
  @tracked availableSessions = [];
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked selectedTarget;

  // =methods

  get showFilters() {
    return (
      this.model.targets.length || this.search || this.availableSessions.length
    );
  }

  /**
   * Returns true if model is empty but we have a search term or filters
   * @returns {boolean}
   */
  get noResults() {
    return (
      this.model.targets.length === 0 &&
      (this.search || this.availableSessions.length)
    );
  }

  /**
   * Returns true if model is empty and we have no search term or filters
   * @returns {boolean}
   */
  get noTargets() {
    return (
      this.model.targets.length === 0 &&
      !(this.search || this.availableSessions.length)
    );
  }

  /**
   * Returns scopes that are associated with all targets user has access to
   * @returns {[ScopeModel]}
   */
  get availableScopes() {
    const uniqueTargetScopeIds = new Set(
      this.model.allTargets.map((target) => target.scope.id),
    );

    return this.model.projects.filter((project) =>
      uniqueTargetScopeIds.has(project.id),
    );
  }

  get availableSessionOptions() {
    return [
      { id: 'yes', name: this.intl.t('actions.yes') },
      { id: 'no', name: this.intl.t('actions.no') },
    ];
  }

  /**
   * Returns active and pending sessions associated with a target
   * sorted descending by created time.
   * @returns {object}
   */
  get sortedTargetSessions() {
    const sessions = this.selectedTarget.sessions.filter(
      (session) => session.isAvailable,
    );
    return orderBy(sessions, 'created_time', 'desc');
  }

  /**
   * Returns true if there are any filters applied
   * @returns {boolean}
   */
  get hasFilters() {
    return this.scopes.length > 0 || this.availableSessions.length > 0;
  }

  /**
   * Returns object of tags to be used for displaying filters
   * @returns {object}
   */
  get tags() {
    const tags = {
      scopes: [],
      availableSessions: [],
      type: [],
    };

    if (this.scopes.length > 0) {
      tags.scopes = this.scopes.map((scope) => ({
        id: scope,
        name: this.scopeDisplayName(scope),
      }));
    }

    if (this.availableSessions.length > 0) {
      tags.availableSessions = this.availableSessions.map((option) => ({
        id: option,
        name: this.availableSessionOptions.find(
          (availableSessionOption) => availableSessionOption.id === option,
        ).displayName,
      }));
    }

    return tags;
  }

  // =methods

  /**
   * Quick connect method used to call main connect method and handle
   * connection errors unique to this route
   * @param {TargetModel} target
   */
  @action
  async quickConnect(target) {
    try {
      await this.connect(target);
    } catch (error) {
      this.confirm
        .confirm(error.message, { isConnectError: true })
        // Retry
        .then(() => this.quickConnect(target));
    }
  }

  /**
   * Establish a session to current target.
   * @param {TargetModel} target
   * @param {HostModel} host
   */
  @action
  @loading
  async connect(target, host) {
    // Check for CLI
    const cliExists = await this.ipc.invoke('cliExists');
    if (!cliExists) throw new Error('Cannot find Boundary CLI.');

    const options = {
      target_id: target.id,
      token: this.session.data.authenticated.token,
    };

    if (host) options.host_id = host.id;

    // Create target session
    const connectionDetails = await this.ipc.invoke('connect', options);

    // Associate the connection details with the session
    let session;
    const { session_id, address, port, credentials, expiration } =
      connectionDetails;
    try {
      session = await this.store.findRecord('session', session_id, {
        reload: true,
      });
    } catch (error) {
      /**
       * if the user cannot read or fetch the session we add the important
       * information returned from the connect command to allow the user
       * to still continue their work with the information they need
       */
      this.store.pushPayload('session', {
        sessions: [
          {
            id: session_id,
            proxy_address: address,
            proxy_port: port,
            target_id: target.id,
            expiration_time: expiration,
          },
        ],
      });

      session = this.store.peekRecord('session', session_id);
    }

    // Flag the session has been open in the desktop client
    session.started_desktop_client = true;
    /**
     * Update the session record with proxy information from the CLI
     * In the future, it may make sense to push this off to the API so that
     * we don't have to manually persist the proxy details.
     */
    session.proxy_address = address;
    session.proxy_port = port;
    if (credentials) {
      credentials.forEach((cred) => session.addCredential(cred));
    }

    this.router.transitionTo(
      'scopes.scope.projects.sessions.session',
      session_id,
    );
  }

  /**
   * Handles input on each keystroke and the search queryParam
   * @param {object} event
   */
  @action
  @debounce(250)
  handleSearchInput(event) {
    const { value } = event.target;
    this.search = value;
    this.page = 1;
  }

  /**
   * Takes the scopeId and returns the displayName of the scope
   * @param {string} scopeId
   * @returns {string}
   */
  @action
  scopeDisplayName(scopeId) {
    const scope = this.model.projects.find((project) => project.id === scopeId);
    return scope.displayName;
  }

  @action
  toggleSessionsFlyout() {
    this.sessionsFlyoutActive = !this.sessionsFlyoutActive;
  }

  /**
   * Sets the scopes query param to value of selectedScopes
   * to trigger a query and closes the dropdown
   * @param {function} close
   */
  @action
  applyFilter(paramKey, selectedItems) {
    this[paramKey] = [...selectedItems];
    this.page = 1;
  }

  /**
   * Toggle the sessions flyout and initialize variable to store selected target
   * @param {object} selectedTarget
   */
  @action
  selectTarget(selectedTarget) {
    this.selectedTarget = selectedTarget;
  }

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
    this.router.refresh();
  }
}
