import EmberRouter from '@ember/routing/router';
import config from 'admin/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('authentication-complete');
  this.route('authentication-error');

  this.route('scopes', function () {
    this.route('scope', { path: ':scope_id' }, function () {
      this.route('authenticate', function () {
        this.route('method', { path: ':auth_method_id' }, function () {
          this.route('oidc');
        });
      });

      this.route('scopes', function () {});
      this.route('edit');
      this.route('new');

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
          this.route('managed-groups', function () {
            this.route(
              'managed-group',
              { path: ':managed_group_id' },
              function () {
                this.route('members');
              }
            );
            this.route('new');
          });
        });
        this.route('new');
      });

      this.route('sessions', function () {});

      this.route('targets', function () {
        this.route('target', { path: ':target_id' }, function () {
          this.route('host-sources', function () {});
          this.route('add-host-sources');
          this.route('credential-sources');
          this.route('add-credential-sources');
        });
        this.route('new');
      });

      this.route('host-catalogs', function () {
        this.route('new');
        this.route('host-catalog', { path: ':host_catalog_id' }, function () {
          this.route('hosts', function () {
            this.route('new');
            this.route('host', { path: ':host_id' }, function () {});
          });
          this.route('host-sets', function () {
            this.route('new');
            this.route('host-set', { path: ':host_set_id' }, function () {
              this.route('hosts', function () {
                this.route('host', { path: ':host_id' }, function () {});
              });
              this.route('add-hosts');
              this.route('create-and-add-host');
            });
          });
        });
      });
      this.route('credential-stores', function () {
        this.route(
          'credential-store',
          { path: ':credential_store_id' },
          function () {
            this.route('credential-libraries', function () {
              this.route('new');
              this.route(
                'credential-library',
                { path: ':credential_library_id' },
                function () {}
              );
            });
            this.route('credentials', function () {
              this.route('new');
              this.route(
                'credential',
                { path: ':credential_id' },
                function () {}
              );
            });
          }
        );
        this.route('new');
      });
      this.route('workers', function () {
        this.route('new');
        this.route('worker', { path: ':worker_id' }, function () {});
      });
    });
  });

  this.route('account', function () {
    this.route('change-password');
  });

  this.route('onboarding', function () {
    this.route('quick-setup', function () {
      this.route('choose-path');
      this.route('create-resources', function () {
        this.route('success');
      });
    });
  });
});
