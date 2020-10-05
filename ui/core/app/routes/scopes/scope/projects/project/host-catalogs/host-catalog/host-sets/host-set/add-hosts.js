import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { hash } from 'rsvp';
import loading from 'ember-loading/decorator';

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
    const { id: host_catalog_id } = this.modelFor(
      'scopes.scope.projects.project.host-catalogs.host-catalog'
    );
    return hash({
      hostSet: this.modelFor(
        'scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set'
      ),
      hosts: this.store.query('host', { host_catalog_id }),
    });
  }

  /**
   * Renders the add-hosts-specific header template.
   * Empties the actions and navigation outlets and renders a custom empty header.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render(
      'scopes/scope/projects/project/host-catalogs/host-catalog/host-sets/host-set/add-hosts/-header',
      {
        into: 'scopes/scope/projects/project/host-catalogs/host-catalog',
        outlet: 'header',
      }
    );

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
   * Saves host IDs on the host set.
   * @param {HostSetModel} hostSet
   */
  @action
  @loading
  async addHosts(hostSet, hostIDs) {
    try {
      await hostSet.addHosts(hostIDs);
      await this.replaceWith(
        'scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set.hosts'
      );
      this.notify.success(this.intl.t('notifications.add-success'));
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
    this.replaceWith(
      'scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set.hosts'
    );
  }
}
