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

  // =methods

  /**
   * Load a target
   * @param {object} params
   * @param {string} params.target_id
   * @return {TargetModel}
   */
  model({ target_id }) {
    return this.store.findRecord('target', target_id, {
      reload: true,
    });
  }

  async afterModel(model, transition) {
    const { isConnecting } = transition.to.queryParams;

    if (isConnecting && model.address) {
      await this.connect(model);
    } else {
      const hostSets = await Promise.all(
        model.host_sources.map(({ host_source_id }) =>
          this.store.findRecord('host-set', host_source_id)
        )
      );

      // Extract host ids from all host sets
      const hostIds = hostSets.flatMap(({ host_ids }) => host_ids);

      // Load unique hosts
      const uniqueHostIds = new Set(hostIds);

      const hosts = await Promise.all(
        [...uniqueHostIds].map((hostId) =>
          this.store.findRecord('host', hostId)
        )
      );

      if (isConnecting && hosts.length === 1) {
        await this.connect(model);
      }

      model.set('hosts', hosts);
    }
  }

  /**
   * Determine if we show host modal or quick connect based on target attributes.
   * @param {TargetModel} model
   */
  @action
  @loading
  async preConnect(target) {
    if (target.address || target.hosts.length === 1) {
      await this.connect(target);
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

      await this.router.transitionTo(
        'scopes.scope.projects.sessions.session',
        session
      );
    } catch (e) {
      this.confirm
        .confirm(e.message, { isConnectError: true })
        // Retry
        .then(() => this.connect(model))
        .catch(() => null /* no op */);
    }
  }
}
