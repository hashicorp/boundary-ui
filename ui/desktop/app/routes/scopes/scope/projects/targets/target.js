/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeProjectsTargetsTargetRoute extends Route {
  // =services

  @service store;

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
            this.store.findRecord('host-set', host_source_id),
          ),
        );

        // Extract host ids from all host sets
        const hostIds = hostSets.flatMap(({ host_ids }) => host_ids);

        // Load unique hosts
        const uniqueHostIds = new Set(hostIds);

        hosts = await Promise.all(
          [...uniqueHostIds].map((hostId) =>
            this.store.findRecord('host', hostId),
          ),
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
      /* eslint-disable-next-line ember/no-controller-access-in-routes */
      const controller = this.controllerFor(
        'scopes.scope.projects.targets.target',
      );
      await controller.connect(model.target);
    }
  }

  /**
   * Sets the 'isConnecting' queryParam to false if connection failed.
   * @returns {boolean}
   */
  @action
  didTransition() {
    /* eslint-disable-next-line ember/no-controller-access-in-routes */
    const controller = this.controllerFor(
      'scopes.scope.projects.targets.target',
    );
    if (controller.isConnectionError) {
      controller.set('isConnecting', false);
      controller.set('isConnectionError', false);
    }
    return true;
  }
}
