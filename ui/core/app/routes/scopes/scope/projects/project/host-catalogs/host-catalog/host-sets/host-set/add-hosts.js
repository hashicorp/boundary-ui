import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { hash } from 'rsvp';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostSetsHostSetAddHostsRoute extends Route {

  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Empty out any previously loaded hosts.
   */
  beforeModel() {
    this.store.unloadAll('host');
  }

  /**
   * Loads current host set and all hosts under the current host catalog.
   * @return {Promise{HostSetModel,[HostModel]}}
   */
  async model() {
    const scopeID = this.modelFor('scopes.scope.projects.project').id;
    const hostCatalogID = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog').id;
    return hash({
      hostSet: this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set'),
      hosts: this.store.findAll('host', { adapterOptions: { scopeID, hostCatalogID } })
    });
  }

  /**
   * Renders the add-hosts-specific header template.
   * Empties the actions and navigation outlets and renders a custom empty header.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/projects/project/host-catalogs/host-catalog/host-sets/host-set/add-hosts/-header', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'header',
    });

    this.render('-empty', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'navigation',
    });

    this.render('-empty', {
      into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
      outlet: 'actions',
    });
  }

  // =actions

  /**
   * Toggles the presence of the passed host ID in the passed host set's
   * `host_ids` field.
   * @param {HostSetModel} hostSet
   * @param {HostModel} host
   */
  @action
  toggleHost(hostSet, host) {
    const isHostSelected = Boolean(hostSet.host_ids.findBy('value', host.id));
    const fragment = hostSet.host_ids.findBy('value', host.id);
    if (isHostSelected) {
      // if host is already selected, filter it out
      hostSet.host_ids.removeObject(fragment);
    } else {
      // if host is not selected, add it
      hostSet.host_ids.addObject({ value: host.id });
    }
  }

  /**
   * Saves host IDs on the host set.
   * @param {HostSetModel} hostSet
   */
  @action
  async addHosts(hostSet, hostIDs) {
    try {
      const scopeID = this.modelFor('scopes.scope.projects.project').id;
      const hostCatalogID = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog').id;
      await hostSet.addHosts(hostIDs, { adapterOptions : { scopeID, hostCatalogID } });
      this.notify.success(
        this.intl.t('notify.save-success')
      );
      this.replaceWith('scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set.hosts');
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Redirect to hosts as if nothing ever happened.
   */
  @action
  cancel() {
    this.replaceWith('scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set.hosts');
  }
}
