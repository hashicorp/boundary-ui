import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

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
    const { isNew } = org;
    org.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope.orgs');
  }

  /**
   * Handle save org.
   * @param {ScopeModel} org
   * @param {Event} e
   */
  @action
  async save(org) {
    const { isNew } = org;
    try {
      await org.save();
      this.refresh();
      this.notify.success(
        this.intl.t(isNew ? 'notifications.create-success' : 'notifications.save-success')
      );
      this.transitionTo('scopes.scope', org);
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
