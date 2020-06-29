import config from '../config/environment';
import { authHandler } from './route-handlers/auth';
// import { Response } from 'miragejs';

export default function() {

  // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.urlPrefix = '';
  // make this `/api`, for example, if your API is namespaced
  this.namespace = config.api.namespace;
  // delay for each request, automatically set to 0 during testing
  this.timing = 350;

  // Allow any configured API host to passthrough, which is useful in
  // development for testing against a locally running backend.
  if (config.api.host) this.passthrough(`${config.api.host}/**`);
  this.passthrough();

  // Scope resources
  // org

  this.get('/orgs');
  this.post('/orgs');
  this.get('/orgs/:id');
  this.patch('/orgs/:id');
  this.del('/orgs/:id');

  // project

  this.get('/orgs/:org_id/projects');
  this.post('/orgs/:org_id/projects');
  this.get('/orgs/:org_id/projects/:id');
  this.patch('/orgs/:org_id/projects/:id');
  this.del('/orgs/:org_id/projects/:id');

  // Auth & IAM resources

  // org-level authentication
  // Mirage actually doesn't distinguish between the next two routes because a
  // colon indicates a dynamic segment.  The routes are included here anyway
  // to communicate the intention that they be different.
  // TODO:  figure out how to make mirage distinguish these
  // eslint-disable-next-line no-useless-escape
  this.post('/orgs/:org_id\:authenticate', authHandler);
  // eslint-disable-next-line no-useless-escape
  this.post('/orgs/:org_id\:deauthenticate', authHandler);

  // auth methods
  this.get('/orgs/:org_id/auth-methods');
  this.post('/orgs/:org_id/auth-methods');
  this.get('/orgs/:org_id/auth-methods/:id');
  this.patch('/orgs/:org_id/auth-methods/:id');
  this.del('/orgs/:org_id/auth-methods/:id');

  // IAM : Users
  this.get('/orgs/:org_id/users');
  this.post('/orgs/:org_id/users');
  this.get('/orgs/:org_id/users/:id');
  this.patch('/orgs/:org_id/users/:id');
  this.del('/orgs/:org_id/users/:id');
  
  // IAM: Roles
  this.get('/orgs/:org_id/roles');
  this.post('/orgs/:org_id/roles');
  this.get('/orgs/:org_id/roles/:id');
  this.patch('/orgs/:org_id/roles/:id');
  this.del('/orgs/:org_id/roles/:id');

  // group
  this.get('/orgs/:org_id/groups');
  this.post('/orgs/:org_id/groups');
  this.get('/orgs/:org_id/groups/:id');
  this.patch('/orgs/:org_id/groups/:id');
  this.del('/orgs/:org_id/groups/:id');

  // Other resources
  
  // host-catalog
  this.get('/orgs/:org_id/projects/:project_id/host-catalogs');
  this.post('/orgs/:org_id/projects/:project_id/host-catalogs');
  this.get('/orgs/:org_id/projects/:project_id/host-catalogs/:id');
  this.patch('/orgs/:org_id/projects/:project_id/host-catalogs/:id');
  this.del('/orgs/:org_id/projects/:project_id/host-catalogs/:id');

  // Uncomment the following line and the Response import above
  // Then change the response code to simulate error responses.
  // this.get('/orgs/:org_id/projects', () => new Response(505));

  // Update error payload to simulate specific error responses.
  // this.get('/orgs/:org_id/projects', () => new Response(505, {}, {
  //   errors: [{
  //     status: 505,
  //     message: 'HTTP version not supported.',
  //   }]
  // }));
}
