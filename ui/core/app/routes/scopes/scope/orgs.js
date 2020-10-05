import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';

export default class ScopesScopeOrgsRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service session;

  // =methods

  /**
   * If arriving here unauthenticated or from a non-global scope,
   * redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.transitionTo('index');
    const scope = this.modelFor('scopes.scope');
    if(!scope.isGlobal) this.transitionTo('index');
  }

  /**
   * Loads all scopes under the global scope.
   * @return {Promise{[ScopeModel]}}
   */
  async model() {
    return this.store.query('scope', { scope_id: 'global' });
  }

  // =actions

  /**
   * Rollback changes on org.
   * @param {ScopeModel} org
   */
  @action
  cancel(org) {
    org.rollbackAttributes();
    this.transitionTo('scopes.scope.orgs');
  }

  /**
   * Handle save org.
   * @param {ScopeModel} org
   * @param {Event} e
   */
  @action
  @loading
  async save(org) {
    try {
      await org.save();
      await this.transitionTo('scopes.scope.projects', org);
      this.refresh();
      this.notify.success(
        this.intl.t('notifications.create-success')
      );
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
      throw error;
    }
  }
}
