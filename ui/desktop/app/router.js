import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('scopes', function() {
    this.route('scope', { path: ':scope_id' }, function() {
      this.route('targets', function() {});
    });
  });
});
