import Route from '@ember/routing/route';
import { all, hash } from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import loading from 'ember-loading/decorator';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeTargetsTargetHostSetsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Loads all host-sets and associated host-catalogs under the current target
   * and it's parent scope.
   * @return {Promise{[HostSetModel, HostCatalogModel]}}
   */
  beforeModel() {
    const { scopeID, host_sets } = this.modelFor('scopes.scope.targets.target');
    const promises = host_sets.map(
      ({ host_source_id, host_catalog_id: hostCatalogID }) =>
        hash({
          // TODO:  multiple host sets may belong to the same catalog,
          // resulting in the catalog being loaded multiple times.
          // An improvement would be to find the unique set of catalogs first.
          hostCatalog: this.store.findRecord('host-catalog', hostCatalogID, {
            adapterOptions: { scopeID },
          }),
          hostSet: this.store.findRecord('host-set', host_source_id, {
            adapterOptions: { scopeID, hostCatalogID },
          }),
        })
    );
    return all(promises);
  }

  /**
   * Returns the previously loaded target instance.
   * @return {TargetModel}
   */
  model() {
    return this.modelFor('scopes.scope.targets.target');
  }

  // =actions

  /**
   * Removes a host set from the current target and redirects to index.
   * @param {TargetModel} target
   * @param {HostSetModel} hostSet
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeHostSet(target, hostSet) {
    await target.removeHostSet(hostSet.id);
    this.refresh();
  }
}
