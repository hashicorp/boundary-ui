import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifyError } from 'core/decorators/notify';

export default class OnboardingQuickSetupCreateResourcesRoute extends Route {
  // =services

  @service router;
  @service intl;

  // =methods

  async model() {
    return {
      org: this.store.createRecord('scope', {
        type: 'org',
        scopeID: 'global',
        name: 'Marketing Department',
        description: 'Sample org created by quick setup',
      }),
      project: this.store.createRecord('scope', {
        type: 'project',
        name: 'New widget ad campaign',
        description: 'Sample project created by quick setup',
      }),
      hostCatalog: this.store.createRecord('host-catalog', {
        type: 'static',
        name: 'All Databases',
        description: 'Sample host catalog created by quick setup',
      }),
      hostSet: this.store.createRecord('host-set', {
        name: 'QA Databases',
        description: 'Sample host set created by quick setup',
      }),
      host: this.store.createRecord('host', {
        name: 'CRM Database',
        description: 'Sample host created by quick setup',
      }),
      target: this.store.createRecord('target', {
        type: 'tcp',
        name: 'CRM Database target',
        description: 'Sample target created by quick setup',
      }),
      role: this.store.createRecord('role', {
        name: 'crm_db_connect_role',
      }),
    };
  }

  // =actions

  @action
  @loading
  @notifyError(function () {
    return this.intl.t('errors.quick-setup-failed.description');
  })
  async createResources(hostAddress, targetPort) {
    try {
      await this.createOnboardingResourcesAndRedirect(hostAddress, targetPort);
    } catch (e) {
      this.router.replaceWith('scopes.scope', 'global');
      throw new Error();
    }
  }

  async createOnboardingResourcesAndRedirect(hostAddress, targetPort) {
    const { org, project, hostCatalog, hostSet, host, target, role } =
      this.currentModel;
    // The Procedure
    await org.save();
    project.scopeID = org.id;
    await project.save();
    hostCatalog.scopeID = project.id;
    await hostCatalog.save();
    hostSet.host_catalog_id = hostCatalog.id;
    await hostSet.save();
    host.host_catalog_id = hostCatalog.id;
    if (hostAddress) {
      host.address = hostAddress;
      await host.save();
      await hostSet.addHosts([host.id]);
      target.scopeID = project.id;
      target.default_port = targetPort;
      await target.save();
      await target.addHostSources([hostSet.id]);
      role.scopeID = org.id;
      role.grant_scope_id = project.id;
      await role.save();
      await role.saveGrantStrings([
        `type=target;actions=list`,
        `id=${target.id};actions=authorize-session`,
      ]);
      this.router.transitionTo(
        'onboarding.quick-setup.create-resources.success'
      );
    } else {
      this.router.transitionTo(
        'scopes.scope.host-catalogs.host-catalog.hosts',
        project.id,
        hostCatalog.id
      );
    }
  }
}
