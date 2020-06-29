import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('orgs', function () {
    this.route('org', { path: ':org_id' }, function () {
      this.route('projects', function () {
        this.route('project', { path: ':project_id' }, function() {
          this.route('host-catalogs', function() {
            this.route('host-catalog', { path: ':host_catalog_id' }, function() {});
            this.route('new');
          });
        });
        this.route('new');
      });

      this.route('users', function() {
        this.route('user', { path: ':user_id' }, function() {});
        this.route('new');
      });
      
      this.route('roles', function() {
        this.route('role', { path: ':role_id' }, function() {});
        this.route('new');
      });

      this.route('groups', function() {
        this.route('group', { path: ':group_id' }, function() {});
        this.route('new');
      });
    });
  });
});
