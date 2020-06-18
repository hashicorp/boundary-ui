import config from '../config/environment';
import loginHandler from './route-handlers/login';

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
  this.post('/orgs/:org_id/login', loginHandler);

  this.get('/orgs/:org_id/auth-methods');
  this.post('/orgs/:org_id/auth-methods');
  this.get('/orgs/:org_id/auth-methods/:id');
  this.patch('/orgs/:org_id/auth-methods/:id');
  this.del('/orgs/:org_id/auth-methods/:id');

  // Other resources
  // host-catalog

  this.get('/orgs/:org_id/projects/:project_id/host-catalogs');
  this.post('/orgs/:org_id/projects/:project_id/host-catalogs');
  this.get('/orgs/:org_id/projects/:project_id/host-catalogs/:id');
  this.patch('/orgs/:org_id/projects/:project_id/host-catalogs/:id');
  this.del('/orgs/:org_id/projects/:project_id/host-catalogs/:id');
}
