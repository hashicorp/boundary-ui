import Route from '@ember/routing/route';
import { hash, all } from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetHostsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Loads all hosts under the current host set.
   * @return {Promise{HostSetModel,[HostModel]}}
   */
  async model() {
    const hostSet = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog.host-sets.host-set'
    );
    return hash({
      hostSet,
      hosts: all(
        hostSet.host_ids.map((host) =>
          this.store.findRecord('host', host.value, { reload: true })
        )
      ),
    });
  }

  /**
   * Remove a host from the current host set and redirect to hosts index.
   * @param {HostSetModel} hostSet
   * @param {HostModel} host
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeHost(hostSet, host) {
    const scopeID = this.modelFor('scopes.scope').id;
    const hostCatalogID = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    ).id;
    await hostSet.removeHost(host.id, {
      adapterOptions: { scopeID, hostCatalogID },
    });
    this.refresh();
  }
}
