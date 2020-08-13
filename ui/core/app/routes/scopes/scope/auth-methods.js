import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeAuthMethodsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Load all auth-methods under current scope
   * @return {Promise[AuthMethodModel]}
   */
  async model() {
    const { id: scopeID} = this.modelFor('scopes.scope');
    return this.store.findAll('auth-method', { adapterOptions: { scopeID } });
  }

  // =actions
  /**
   * Rollback changes to an auth-method.
   * @param {AuthMethodModel} authMethod
   */
  @action
  cancel(authMethod) {
    const { isNew } = authMethod;
    authMethod.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope.auth-methods');
  }

  /**
   * Save an auth-method in current scope.
   * @param {AuthMethodModel} authMethod
   */
  @action
  async save(authMethod) {
    const { isNew } = authMethod;
    try {
      await authMethod.save();
      this.refresh();
      this.notify.success(
        this.intl.t(isNew ? 'notify.create-success' : 'notify.save-success')
      );
      this.transitionTo('scopes.scope.auth-methods.auth-method');
    } catch (error) {
      //TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
