/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('scopes', function () {
    this.route('scope', { path: ':scope_id' }, function () {
      this.route('authenticate', function () {
        this.route('method', { path: ':auth_method_id' }, function () {
          this.route('oidc');
        });
      });
      this.route('projects', function () {
        this.route('targets', function () {
          this.route('target', { path: ':target_id' }, function () {});
        });
        this.route('sessions', function () {
          this.route('session', { path: ':session_id' }, function () {});
        });
        this.route('settings', function () {});
      });
    });
  });
  this.route('cluster-url');
});
