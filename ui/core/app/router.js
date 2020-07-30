import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {

  this.route('scopes', function() {
    this.route('scope', { path: ':scope_id' }, function() {
      this.route('authenticate', function() {
        this.route('method', { path: ':auth_method_id'});
      });
      this.route('projects', function() {
        this.route('project', { path: ':project_id' }, function() {
          this.route('host-catalogs', function() {
            this.route('new');
            this.route('host-catalog', { path: ':host_catalog_id' }, function() {});
          });
        });
        this.route('new');
      });
    });
  });

});
