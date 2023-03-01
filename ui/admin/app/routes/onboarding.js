/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifyError } from 'core/decorators/notify';
import { TYPE_TARGET_TCP } from 'api/models/target';
export default class OnboardingRoute extends Route {
  // =services

  @service store;
  @service session;
  @service router;
  @service intl;

  // =methods

  /**
   * If arriving here unauthenticated, or has orgs redirect to index for further processing.
   */
  async beforeModel() {
    const orgs = await this.store.query('scope', {
      scope_id: 'global',
    });
    if (!this.session.isAuthenticated || orgs.length)
      this.router.transitionTo('index');
  }

  /**
   * List all scopes (orgs) under global.
   * Creare org, project, target and roles
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

  // =actions
  @action
  @loading
  @notifyError(function () {
    return this.intl.t('errors.onboarding-failed.description');
  })
  async createResources(targetAddress, targetPort) {
    const { org, project, target, role } = this.currentModel;

    await this.createOrg(org);
    await this.createProject(org, project);
    await this.createTarget(project, target, targetAddress, targetPort);
    await this.createGrants(org, project, target, role);

    // Redirect to success
    this.router.transitionTo('onboarding.success');
  }

  /**
   * Creates Org, if fails, redirects to Orgs empty list
   * @param {Object} org
   */
  async createOrg(org) {
    try {
      await org.save();
    } catch (error) {
      // Redirects to Orgs screen
      this.router.transitionTo('scopes.scope', 'global');
      throw new Error(error);
    }
  }

  /**
   * Creates Project, if fails redirects to Projects from Org empty list.
   * @param {Object} org
   * @param {Object} project
   */
  async createProject(org, project) {
    project.scopeID = org.id;

    try {
      await project.save();
    } catch (error) {
      // Redirects to Project screen
      this.router.transitionTo('scopes.scope.scopes', project.scopeID);
      throw new Error(error);
    }
  }

  /**
   * Creates a Target, if fails redirects to Targets empyt list.
   * @param {Object} project
   * @param {Object} target
   * @param {Object} targetAddress
   * @param {Object} targetPort
   */
  async createTarget(project, target, targetAddress, targetPort) {
    target.scopeID = project.id;
    target.address = targetAddress;
    target.default_port = targetPort;

    try {
      await target.save();
    } catch (error) {
      // Redirect to targets global
      this.router.replaceWith('scopes.scope.targets', project.scopeID);
      throw new Error(error);
    }
  }

  async createGrants(org, project, target, role) {
    role.scopeID = org.id;
    role.grant_scope_id = project.id;
    try {
      await role.save();
      await role.saveGrantStrings([
        `type=target;actions=list`,
        `id=${target.id};actions=authorize-session`,
      ]);
    } catch (error) {
      // Redirect to targets that belong to scope
      this.router.replaceWith('scopes.scope.targets', project.scopeID);
      throw new Error(error);
    }
  }

  @action
  async doLater() {
    this.router.transitionTo('index');
  }
}
