/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifyError } from 'core/decorators/notify';

export default class OnboardingIndexController extends Controller {
  // =services

  @service intl;
  @service router;

  // =actions

  /**
   * Creates resources then redirects to success page.
   * @param {object} model
   * @param {string} targetAddress
   * @param {string} targetPort
   */
  @action
  @loading
  @notifyError(function () {
    return this.intl.t('errors.onboarding-failed.description');
  })
  async createResources(model, targetAddress, targetPort) {
    const { org, project, target, role } = model;

    await this.createOrg(org);
    await this.createProject(org, project);
    await this.createTarget(project, target, targetAddress, targetPort);
    await this.createGrants(org, project, target, role);

    // Redirect to success
    this.router.transitionTo('onboarding.success');
  }

  /**
   * Creates Org, if fails, redirects to Orgs empty list
   * @param {ScopeModel} org
   */
  async createOrg(org) {
    try {
      await org.save();
    } catch (error) {
      console.log('error ', error);
      // Redirects to Orgs screen
      this.router.transitionTo('scopes.scope', 'global');
      throw new Error(error);
    }
  }

  /**
   * Creates Project, if fails redirects to Projects from Org empty list.
   * @param {ScopeModel} org
   * @param {ScopeModel} project
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
   * Creates a Target, if fails redirects to Targets empty list.
   * @param {ScopeModel} project
   * @param {TargetModel} target
   * @param {string} targetAddress
   * @param {string} targetPort
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

  /**
   * Assigns default grants and scope to a role.
   * @param {ScopeModel} org
   * @param {ScopeModel} project
   * @param {TargetModel} target
   * @param {RoleModel} role
   */
  async createGrants(org, project, target, role) {
    role.scopeID = org.id;
    role.grant_scope_id = project.id;
    try {
      await role.save();
      await role.saveGrantStrings([
        `type=target;actions=list`,
        `ids=${target.id};actions=authorize-session`,
      ]);
    } catch (error) {
      // Redirect to targets that belong to scope
      this.router.replaceWith('scopes.scope.targets', project.scopeID);
      throw new Error(error);
    }
  }

  /**
   * Redirects user to index route for further processing.
   */
  @action
  doLater() {
    this.router.transitionTo('index');
  }
}
