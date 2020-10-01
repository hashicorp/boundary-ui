import Route from '@ember/routing/route';

export default class ScopesScopeUsersUserRoute extends Route {
  // =methods

  /**
   * Load a user in current scope.
   * @param {object} params
   * @param {string} params.user_id
   * @return {UserModel}
   */
  async model({ user_id }) {
    return this.store.findRecord('user', user_id);
  }

  /**
   * Renders the route-set specific page sections
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/users/user/-header', {
      into: 'scopes/scope/users/user',
      outlet: 'header',
    });

    this.render('scopes/scope/users/user/-actions', {
      into: 'scopes/scope/users/user',
      outlet: 'actions',
    });

    this.render('scopes/scope/users/user/-navigation', {
      into: 'scopes/scope/users/user',
      outlet: 'navigation',
    });
  }
}
