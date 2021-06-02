import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthMethodsAuthMethodRoute extends Route {
  // =methods

  /**
   * Load an auth method by ID.
   * @param {object} params
   * @param {string} params.auth_method_id
   * @return {authMethodModel}
   */
  async model({ auth_method_id }) {
    return this.store.findRecord('auth-method', auth_method_id);
  }

  /**
   * Renders the auth-method specific templates for header, navigation,
   * and actions page sections.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/auth-methods/auth-method/-header', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'header',
    });

    this.render('scopes/scope/auth-methods/auth-method/-navigation', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'navigation',
    });

    this.render('scopes/scope/auth-methods/auth-method/-actions', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'actions',
    });
  }

  // =actions

  /**
   * Update state of OIDC auth method
   * @param {string} state - "inactive", "active-private", "active-public"
   */
  @action
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async changeState(state) {
    const model = this.modelFor('scopes.scope.auth-methods.auth-method');
    await model.changeState(state);
  }
}
