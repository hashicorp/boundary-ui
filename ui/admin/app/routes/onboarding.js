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
  async createTarget(targetAddress, targetPort) {
    // Create org and Project
    try {
      await this.createOrgAndProject();
    } catch (error) {
      throw new Error(error);
    }

    // Create target
    try {
      await this.createSampleTarget(targetAddress, targetPort);
      // Redirect to success
      this.router.transitionTo('onboarding.success');
    } catch (error) {
      // Redirect to targets
      this.router.replaceWith('scopes.scope.targets', 'global');
      throw new Error(error);
    }
  }

  /**
   * Persist org and project previously created in the model
   */
  async createOrgAndProject() {
    const { org, project } = this.currentModel;

    await org.save();
    project.scopeID = org.id;
    await project.save();
  }

  /**
   * Creates a Target with provided address and port
   * @param {string} targetAddress
   * @param {string} targetPort
   */
  async createSampleTarget(targetAddress, targetPort) {
    const { target, role, project, org } = this.currentModel;

    // Format target and persist it
    target.scopeID = project.id;
    target.address = targetAddress;
    target.default_port = targetPort;
    await target.save();

    // Format role and role grants and persist them
    role.scopeID = org.id;
    role.grant_scope_id = project.id;
    await role.save();
    await role.saveGrantStrings([
      `type=target;actions=list`,
      `id=${target.id};actions=authorize-session`,
    ]);
  }

  @action
  async doLater() {
    this.router.transitionTo('index');
  }
}
