import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

/**
 * The authentication method route is responsible for displaying the correct
 * authentication UI and delegating authentication to the proper
 * Ember Simple Auth authenticator.
 */
export default class OrgsOrgLoginMethodRoute extends Route {

  // =services

  @service session;
  @service notify;
  @service intl;

  // =actions

  /**
   * Delegates authentication to the `userpass` authenticator.
   * If authentication fails, notifies with an alert.
   */
  @action
  async authenticate(creds) {
    this.controller.setProperties({
      username: null,
      password: null
    });
    try {
      await this.session.authenticate('authenticator:userpass', creds);
    } catch (e) {
      const errorMessage = this.intl.t('errors.titles.authentication-failed');
      this.notify.error(errorMessage, { closeAfter: null });
    }
  }

}
