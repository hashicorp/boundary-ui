import EmberRouter from '@ember/routing/router';
import config from 'core/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('scopes', function () {
    this.route('scope', { path: ':scope_id' }, function () {
      this.route('authenticate', function () {
        this.route('method', { path: ':auth_method_id' });
      });

      this.route('orgs', function () {
        this.route('new');
      });

      this.route('users', function () {
        this.route('user', { path: ':user_id' }, function () {
          this.route('accounts');
          this.route('add-accounts');
        });
        this.route('new');
      });

      this.route('groups', function () {
        this.route('group', { path: ':group_id' }, function () {
          this.route('members');
          this.route('add-members');
        });
        this.route('new');
      });

      this.route('roles', function () {
        this.route('role', { path: ':role_id' }, function () {
          this.route('grants');
          this.route('principals');
          this.route('add-principals');
        });
        this.route('new');
      });

      this.route('auth-methods', function () {
        this.route('auth-method', { path: ':auth_method_id' }, function () {
          this.route('accounts', function () {
            this.route('account', { path: ':account_id' }, function () {
              this.route('set-password');
            });
            this.route('new');
          });
        });
        this.route('new');
      });
      this.route('scopes', function() {});
      this.route('edit');
      this.route('new');
      this.route('sessions', function() {});
    });
  });

  this.route('account', function() {
    this.route('change-password');
  });
});
