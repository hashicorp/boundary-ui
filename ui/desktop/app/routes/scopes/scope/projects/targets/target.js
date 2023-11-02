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
      await model.target.connect(null, this.errorHandler);
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
    await target.connect(host, this.errorHandler);
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
      await model.target.connect(null, this.errorHandler);
    } else {
      toggleModal(true);
    }
  }

  /**
   * Used as a callback to when connection fails
   */
  @action
  errorHandler(value) {
    this.isConnectionError = value;
    /* eslint-disable-next-line ember/no-controller-access-in-routes */
    const controller = this.controllerFor(
      'scopes.scope.projects.targets.target'
    );
    controller.set('isConnecting', false);
  }
}
