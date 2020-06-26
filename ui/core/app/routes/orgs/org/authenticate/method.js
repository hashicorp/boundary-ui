import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

/**
 * The authentication method route is responsible for displaying the correct
 * authentication UI and delegating authentication to the proper
 * Ember Simple Auth authenticator.
 */
export default class OrgsOrgAuthenticateMethodRoute extends Route {

  // =services

  @service session;
  @service notify;
  @service intl;

  // =methods

  /**
   * Returns an auth method by id.
   * @param {object} params
   * @return {Promise{AuthMethodModel}}
   */
  model({ auth_method_id: id }) {
    return this.store.findRecord('auth-method', id);
  }

  // =actions

  /**
   * Delegates authentication to the `password` authenticator.
   * If authentication fails, notifies with an alert.
   */
  @action
  async authenticate(creds) {
    const authenticatorName = 'authenticator:password'
    const authMethodId = this.currentModel.id;
    this.controller.setProperties({
      username: null,
      password: null
    });
    const requestCookies = false;
    try {
      await this.session.authenticate(
        authenticatorName, creds, authMethodId, requestCookies);
      this.transitionTo('orgs.org.projects');
    } catch (e) {
      const errorMessage = this.intl.t('errors.titles.authentication-failed');
      this.notify.error(errorMessage, { closeAfter: null });
    }
  }

}
