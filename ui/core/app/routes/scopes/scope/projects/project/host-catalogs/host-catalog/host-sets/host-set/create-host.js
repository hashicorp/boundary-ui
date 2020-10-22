import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { hash } from 'rsvp';
import loading from 'ember-loading/decorator';
import { notifySuccess, notifyError } from '../../../../../../../../../decorators/notify';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostSetsHostSetCreateHostRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Creates a new unsaved host in current host catalog scope.
   * @return {Promise{HostSetModel,HostModel}}
   */
  async model() {
    const { id: host_catalog_id } = this.modelFor(
      'scopes.scope.projects.project.host-catalogs.host-catalog'
    );

    return hash({
      hostSet: this.modelFor(
        'scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set'
      ),
      host: this.store.createRecord('host', {
        type: 'static',
        host_catalog_id,
      }),
    });
  }

  /**
   * Renders the create-host-specific header template.
   * Empties the actions and navigation outlets and renders a custom empty header.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render(
      'scopes/scope/projects/project/host-catalogs/host-catalog/host-sets/host-set/create-host/-header',
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
   * Saves host and add it to current host set.
   * @param {HostSetModel,HostModel} model
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async save(model) {
    await model.host.save();
    await model.hostSet.addHost(model.host.id);
    await this.replaceWith(
      'scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set.hosts'
    );
  }

  /**
   * Redirect to hosts in host set as if nothing ever happened.
   */
  @action
  cancel() {
    this.replaceWith(
      'scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set.hosts'
    );
  }
}
