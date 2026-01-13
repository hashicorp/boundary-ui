/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

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

      this.route('scopes', function () {
        this.route('new');
      });
      this.route('edit');
      this.route('add-storage-policy', function () {
        this.route('create');
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
          this.route('scopes');
          this.route('manage-scopes', function () {
            this.route('manage-custom-scopes');
            this.route('manage-org-projects', { path: ':org_id' });
          });
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
              },
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
          this.route('brokered-credential-sources');
          this.route('injected-application-credential-sources');
          this.route('add-brokered-credential-sources');
          this.route('add-injected-application-credential-sources');
          this.route('create-alias');
          this.route('manage-alias', { path: ':alias_id' }, function () {});
          this.route('enable-session-recording', function () {
            this.route('create-storage-bucket');
          });
          this.route('workers');
          this.route('edit-ingress-worker-filter');
          this.route('edit-egress-worker-filter');
        });
        this.route('new');
      });

      this.route('aliases', function () {
        this.route('new');
        this.route('alias', { path: ':alias_id' }, function () {});
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
                function () {},
              );
            });
            this.route('credentials', function () {
              this.route('new');
              this.route(
                'credential',
                { path: ':credential_id' },
                function () {},
              );
            });
            this.route('worker-filter');
            this.route('edit-worker-filter');
          },
        );
        this.route('new');
      });
      this.route('workers', function () {
        this.route('new');
        this.route('worker', { path: ':worker_id' }, function () {
          this.route('tags');
          this.route('create-tags');
        });
      });
      this.route('session-recordings', function () {
        this.route(
          'session-recording',
          { path: ':session_recording_id' },
          function () {
            this.route('channels-by-connection', function () {
              this.route('channel', { path: ':channel_id' }, function () {});
            });
          },
        );
      });
      this.route('storage-buckets', function () {
        this.route('new');
        this.route(
          'storage-bucket',
          { path: ':storage_bucket_id' },
          function () {},
        );
      });

      this.route('policies', function () {
        this.route('new');
        this.route('policy', { path: ':policy_id' }, function () {});
      });
      this.route('app-tokens', function () {
        this.route('new');
        this.route('app-token', { path: ':token_id' }, function () {
          this.route('permissions');
        });
      });
    });
  });

  this.route('account', function () {
    this.route('change-password');
  });

  this.route('onboarding', function () {
    this.route('success');
  });
});
