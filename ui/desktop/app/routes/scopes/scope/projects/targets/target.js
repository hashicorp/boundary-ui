/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';

export default class ScopesScopeProjectsTargetsTargetRoute extends Route {
  // =services

  @service store;
  @service confirm;
  @service ipc;
  @service router;
  @service session;

  // =attributes

  isConnectionError = false;

  // =methods

  /**
   * Load a target
   * @param {object} params
   * @param {string} params.target_id
   * @return {{ target: TargetModel, hosts: [HostModel] }}
   */
  async model({ target_id }) {
    let hosts = [];

    const target = await this.store.findRecord('target', target_id, {
      reload: true,
    });

    if (target.host_sources.length >= 1) {
      /**
       * if user does not have permissions to fetch host-sets or hosts
       * this will catch the error and return an empty array
       * from the model hook for hosts
       */
      try {
        const hostSets = await Promise.all(
          target.host_sources.map(({ host_source_id }) =>
            this.store.findRecord('host-set', host_source_id)
          )
        );

        // Extract host ids from all host sets
        const hostIds = hostSets.flatMap(({ host_ids }) => host_ids);

        // Load unique hosts
        const uniqueHostIds = new Set(hostIds);

        hosts = await Promise.all(
          [...uniqueHostIds].map((hostId) =>
            this.store.findRecord('host', hostId)
          )
        );
      } catch (error) {
        // no operation
      }
    }

    return { target, hosts };
  }

  async afterModel(model, transition) {
    const { isConnecting } = transition.to.queryParams;

    /**
     * if connecting and hosts length is 1 or less we will try to
     * connect, even if there is no address on the target and
     * rely on the CLI to give the user the proper error
     */
    if (isConnecting && model.hosts.length <= 1) {
      await this.connect(model.target);
    }
  }

  /**
   * Sets the 'isConnecting' queryParam to false if connection failed.
   * @returns {boolean}
   */
  @action
  didTransition() {
    if (this.isConnectionError) {
      /* eslint-disable-next-line ember/no-controller-access-in-routes */
      const controller = this.controllerFor(
        'scopes.scope.projects.targets.target'
      );
      controller.set('isConnecting', false);
      this.isConnectionError = false;
    }
    return true;
  }

  /**
   * Establish a session to current target.
   * @param {TargetModel} target
   * @param {HostModel} host
   * hostConnect is only called when making a connection with a host and ensures that the host modal is automatically closed in the case of a connection error.
   */
  @action
  async hostConnect(target, host) {
    await this.connect(target, host);
    if (this.isConnectionError) {
      /* eslint-disable-next-line ember/no-controller-access-in-routes */
      const controller = this.controllerFor(
        'scopes.scope.projects.targets.target'
      );
      controller.set('isConnecting', false);
      this.isConnectionError = false;
    }
  }

  /**
   * Determine if we show host modal or quick connect based on target attributes.
   * @param {TargetModel} model
   */
  @action
  @loading
  async preConnect(model, toggleModal) {
    /**
     * if hosts length is 1 or less we will try to
     * connect, even if there is no address on the target and
     * rely on the CLI to give the user the proper error or if
     * there are 2 or more hosts we show the modal for host selection
     */
    if (model.hosts.length <= 1) {
      await this.connect(model.target);
    } else {
      toggleModal(true);
    }
  }

  /**
   * Establish a session to current target.
   * @param {TargetModel} model
   * @param {HostModel} host
   */
  @action
  @loading
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
        this.store.pushPayload({
          sessions: [
            {
              id: session_id,
              proxy_address: address,
              proxy_port: port,
            },
          ],
        });
        session = await this.store.peekRecord('session', session_id);
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

      await this.router.transitionTo(
        'scopes.scope.projects.sessions.session',
        session_id
      );
    } catch (e) {
      this.isConnectionError = true;
      this.confirm
        .confirm(e.message, { isConnectError: true })
        // Retry
        .then(() => this.connect(model, host))
        .catch(() => {
          // Reset the flag as this was user initiated and we're not
          // in a transition or have a host modal open
          this.isConnectionError = false;
        });
    }
  }
}
