import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { all } from 'rsvp';
import loading from 'ember-loading/decorator';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeTargetsTargetAddHostSourcesRoute extends Route {
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
    const target = this.modelFor('scopes.scope.targets.target');
    const { id: scope_id } = this.modelFor('scopes.scope');
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
   * Renders the add-host-sources-specific header template.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/targets/target/add-host-sources/-header', {
      into: 'scopes/scope/targets/target',
      outlet: 'header',
    });

    this.render('-empty', {
      into: 'scopes/scope/targets/target',
      outlet: 'navigation',
    });

    this.render('-empty', {
      into: 'scopes/scope/targets/target',
      outlet: 'actions',
    });
  }

  // =actions

  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async save(target, hostSetIDs) {
    await target.addHostSources(hostSetIDs);
    this.replaceWith('scopes.scope.targets.target.host-sources');
  }

  /**
   * Redirect to target host sources as if nothing ever happened.
   */
  @action
  cancel() {
    this.replaceWith('scopes.scope.targets.target.host-sources');
  }
}
