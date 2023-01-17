import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifyError } from 'core/decorators/notify';
import { TYPE_TARGET_TCP } from 'api/models/target';

export default class OnboardingQuickSetupCreateResourcesRoute extends Route {
  // =services

  @service store;
  @service router;
  @service intl;

  // =methods

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
      hostCatalog: this.store.createRecord('host-catalog', {
        type: 'static',
        name: 'US-East-1',
        description: 'Sample host catalog created by quick setup',
      }),
      hostSet: this.store.createRecord('host-set', {
        name: 'Prod-EC2',
        description: 'Sample host set created by quick setup',
      }),
      host: this.store.createRecord('host', {
        name: 'Instance-1',
        description: 'Sample host created by quick setup',
      }),
      target: this.store.createRecord('target', {
        type: TYPE_TARGET_TCP,
        name: 'EC2 Instances',
        description: 'Sample target created by quick setup',
      }),
      role: this.store.createRecord('role', {
        name: 'ec2_connect_role',
      }),
    };
  }

  // =actions

  @action
  @loading
  @notifyError(function () {
    return this.intl.t('errors.quick-setup-failed.description');
  })
  async createResources(targetAddress, targetPort) {
    try {
      await this.createOnboardingResourcesAndRedirect(
        targetAddress,
        targetPort
      );
    } catch (e) {
      this.router.replaceWith('scopes.scope', 'global');
      throw new Error();
    }
  }

  async createOnboardingResourcesAndRedirect(targetAddress, targetPort) {
    const { org, project, hostCatalog, hostSet, host, target, role } =
      this.currentModel;

    // Persist org and project
    await org.save();
    project.scopeID = org.id;
    await project.save();

    if (targetAddress) {
      // Format target object and persist it
      target.scopeID = project.id;
      target.address = targetAddress;
      target.default_port = targetPort;
      await target.save();
      // Format role and role grants objects and persist them
      role.scopeID = org.id;
      role.grant_scope_id = project.id;
      await role.save();
      await role.saveGrantStrings([
        `type=target;actions=list`,
          `id=${target.id};actions=authorize-session`,
      ]);
      // Redirect
      this.router.transitionTo(
        'onboarding.quick-setup.create-resources.success'
      );
    } else {
      // Create and persist host catalog, host set and host.
      hostCatalog.scopeID = project.id;
      await hostCatalog.save();
      hostSet.host_catalog_id = hostCatalog.id;
      await hostSet.save();
      host.host_catalog_id = hostCatalog.id;
      // Redirect
      this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.hosts',
        project.id,
        hostCatalog.id
      );
    }
  }
}
