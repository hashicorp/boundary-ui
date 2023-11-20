/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { tracked } from '@glimmer/tracking';

export default class ScopesScopeProjectsTargetsIndexController extends Controller {
  // =services

  @service confirm;
  @service ipc;
  @service router;
  @service session;
  @service store;

  // =attributes

  @tracked targets = this.model;
  @tracked freeSearch;
  @tracked searchItems = ['Project 1', 'Project 2', 'Project 3'];
  searchableProps = ['id', 'name', 'description', 'address', 'scope_id'];

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
    const { session_id, address, port, credentials } = connectionDetails;
    try {
      session = await this.store.findRecord('session', session_id);
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
      session_id
    );
  }

  /**
   * Handles input on each keystroke and triggers the search
   * @param {object} event
   */
  @action
  async handleInput(event) {
    const { value } = event.target;
    this.freeSearch = value;
    await this.search();
  }

  /**
   * builds a query string for all searchable target properties
   * @returns {string}
   */
  buildQuery() {
    return this.searchableProps
      .map((prop) => `${prop} % '${this.freeSearch}'`)
      .join(' or ');
  }

  /**
   * queries for targets based on input from user
   */
  @action
  async search() {
    if (this.freeSearch) {
      const query = this.buildQuery();
      this.targets = await this.store.query('target', { query });
    } else {
      this.targets = this.model;
    }
  }
}
