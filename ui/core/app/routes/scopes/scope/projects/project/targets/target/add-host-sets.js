import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { all } from 'rsvp';
import loading from 'ember-loading/decorator';
import { notifySuccess, notifyError } from '../../../../../../../decorators/notify';

export default class ScopesScopeProjectsProjectTargetsTargetAddHostSetsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Empty out any previously loaded host sets.
   */
  beforeModel() {
    this.store.unloadAll('host-set');
  }

  /**
   * Returns the current target, all host catalogs, and all host sets.
   * @return {{target: TargetModel, hostCatalogs: [HostCatalogModel], hostSets: [HostSetModel]}}
   */
  async model() {
    const target = this.modelFor(
      'scopes.scope.projects.project.targets.target'
    );
    const { id: scope_id } = this.modelFor('scopes.scope.projects.project');
    const hostCatalogs = await this.store.query('host-catalog', { scope_id });
    await all(
      hostCatalogs.map(({ id: host_catalog_id }) =>
        this.store.query('host-set', { host_catalog_id })
      )
    );
    const hostSets = this.store.peekAll('host-set');
    return {
      target,
      hostCatalogs,
      hostSets,
    };
  }

  /**
   * Renders the add-host-sets-specific header template.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render(
      'scopes/scope/projects/project/targets/target/add-host-sets/-header',
      {
        into: 'scopes/scope/projects/project/targets/target',
        outlet: 'header',
      }
    );

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
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async save(target, hostSetIDs) {
    await target.addHostSets(hostSetIDs);
    this.replaceWith(
      'scopes.scope.projects.project.targets.target.host-sets'
    );
  }

  /**
   * Redirect to target host sets as if nothing ever happened.
   */
  @action
  cancel() {
    this.replaceWith('scopes.scope.projects.project.targets.target.host-sets');
  }
}
