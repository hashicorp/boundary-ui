/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { resourceFilter } from 'core/decorators/resource-filter';

export default class ScopesScopeProjectsTargetsRoute extends Route {
  // =services

  @service can;
  @service clusterUrl;
  @service confirm;
  @service ipc;
  @service resourceFilterStore;
  @service router;
  @service session;
  @service store;

  // =attributes

  @resourceFilter({
    allowed: (route) => route.modelFor('scopes.scope.projects'),
    serialize: ({ id }) => id,
    findBySerialized: ({ id }, value) => id === value,
  })
  project;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Loads all targets under current scope.
   *
   * NOTE:  previously, targets were filtered with API filter queries.
   *        In an effort to offload processing from the controller, targets
   *        are now filtered on the client by projects and authorized_actions.
   *
   * @return {Promise{[TargetModel]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const queryOptions = { scope_id, recursive: true };

    // Recursively query all targets within the current scope
    let targets = await this.store.query('target', queryOptions);

    // Filter out targets to which users do not have the connect ability
    targets = targets.filter((t) => this.can.can('connect target', t));

    // If project filters are selected, filter targets by the selected projects
    if (this.project?.length) {
      const projectIDs = this.project.map((p) => p?.id);
      targets = targets.filter((t) => projectIDs.includes(t?.scopeID));
    }

    return targets;
  }

  // =actions

  @action
  acknowledge(session) {
    session.acknowledged = true;
  }

  /**
   * Establish a session to current target.
   * @param {TargetModel} model
   * @param {HostModel} host
   */
  @action
  async connect(model, host) {
    // TODO: Connect: move this logic into the target model
    try {
      // Check for CLI
      const cliExists = await this.ipc.invoke('cliExists');
      if (!cliExists) throw new Error('Cannot find Boundary CLI.');

      const options = {
        target_id: model.id,
        token: this.session.data.authenticated.token,
      };

      if (host) options.host_id = host.id;

      // Create target session
      const connectionDetails = await this.ipc.invoke('connect', options);

      // Associate the connection details with the session
      const { session_id, address, port, credentials } = connectionDetails;
      const session = await this.store.findRecord('session', session_id);

      // Flag the session has been open in the desktop client
      session.started_desktop_client = true;
      // Update the session record with proxy information from the CLI
      // In the future, it may make sense to push this off to the API so that
      // we don't have to manually persist the proxy details.
      session.proxy_address = address;
      session.proxy_port = port;
      if (credentials) {
        credentials.forEach((cred) => session.addCredential(cred));
      }
    } catch (e) {
      this.confirm
        .confirm(e.message, { isConnectError: true })
        // Retry
        .then(() => this.connect(model))
        .catch(() => null /* no op */);
    }
  }

  /**
   * Sets the specified resource filter field to the specified value.
   * @param {string} field
   * @param value
   */
  @action
  filterBy(field, value) {
    this[field] = value;
  }

  /**
   * Clears and filter selections.
   */
  @action
  clearAllFilters() {
    this.project = [];
  }

  /**
   * refreshes target data.
   */
  @action
  async refreshTargets() {
    return this.refresh();
  }
}
