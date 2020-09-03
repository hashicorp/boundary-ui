import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { all } from 'rsvp';

export default class ScopesScopeProjectsProjectTargetsTargetAddHostSetsRoute extends Route {

  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Empty out any previously loaded host catalogs and host sets.
   */
  beforeModel() {
    this.store.unloadAll('host-catalog');
    this.store.unloadAll('host-set');
  }

  /**
   * Returns the current target, all host catalogs, and all host sets.
   * @return {{target: TargetModel, hostCatalogs: [HostCatalogModel], hostSets: [HostSetModel]}}
   */
  async model() {
    const target =
      this.modelFor('scopes.scope.projects.project.targets.target');
    const { scopeID } = target;
    const hostCatalogs =
      await this.store.findAll('host-catalog', { adapterOptions: { scopeID } });
    await all(hostCatalogs.map(({ id: hostCatalogID }) =>
      this.store
        .findAll('host-set', { adapterOptions: { scopeID, hostCatalogID } })
    ));
    const hostSets = this.store.peekAll('host-set');
    return {
      target,
      hostCatalogs,
      hostSets
    };
  }

  /**
   * Renders the add-host-sets-specific header template.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/projects/project/targets/target/add-host-sets/-header', {
      into: 'scopes/scope/projects/project/targets/target',
      outlet: 'header',
    });

    this.render('-empty', {
      into: 'scopes/scope/projects/project/targets/target',
      outlet: 'navigation',
    });

    this.render('-empty', {
      into: 'scopes/scope/projects/project/targets/target',
      outlet: 'actions',
    });
  }

  // =actions

  @action
  async save(target, hostSetIDs) {
    try {
      await target.addHostSets(hostSetIDs);
      this.replaceWith('scopes.scope.projects.project.targets.target.host-sets');
      this.notify.success(this.intl.t('notify.save-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Redirect to target host sets as if nothing ever happened.
   */
  @action
  cancel() {
    this.replaceWith('scopes.scope.projects.project.targets.target.host-sets');
  }
}
