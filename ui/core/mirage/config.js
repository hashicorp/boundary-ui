import config from '../config/environment';
import { Response } from 'miragejs';

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

  this.get('/scopes', ({ scopes }, { queryParams: { scope_id } }) => {
    // Default parent scope is global
    if (!scope_id) scope_id = 'global';
    return scopes.where(scope => {
      return scope.scope ? scope.scope.id === scope_id : false
    });
  });
  this.post('/scopes', function ({ scopes }, request) {
    // Parent scope comes through the payload via `scope_id`, but this needs
    // to be expanded to a scope object `scope: {id:..., type:...}` before
    // saving, which is the gist of this function.
    const attrs = this.normalizedRequestAttrs();
    const parentScopeAttrs = this.serialize(scopes.find(request.queryParams.scope_id));
    attrs.scope = parentScopeAttrs;
    return scopes.create(attrs);
  });
  // To simulate a possible real-world case, org scopes are not returned,
  // but project scopes are.
  // TODO this should be expanded to support other scenarios.
  this.get('/scopes/:id', ({ scopes }, { params: { id: scopeID } }) => {
    const scope = scopes.find(scopeID);
    if (scope.type !== 'project') {
      return new Response(404, {}, {});
    } else {
      return scope;
    }
  });
  this.patch('/scopes/:id');
  this.del('/scopes/:id');

  // Auth & IAM resources

  this.get('/scopes/:scope_id/auth-methods');
  this.post('/scopes/:scope_id/auth-methods');
  this.get('/scopes/:scope_id/auth-methods/:id');
  this.patch('/scopes/:scope_id/auth-methods/:id');
  this.del('/scopes/:scope_id/auth-methods/:id');

  // IAM : Users
  this.get('/scopes/:scope_id/users');
  this.post('/scopes/:scope_id/users');
  this.get('/scopes/:scope_id/users/:id');
  this.patch('/scopes/:scope_id/users/:id');
  this.del('/scopes/:scope_id/users/:id');

  // IAM: Roles
  this.get('/scopes/:scope_id/roles');
  this.post('/scopes/:scope_id/roles');
  this.get('/scopes/:scope_id/roles/:id');
  this.patch('/scopes/:scope_id/roles/:id');
  this.del('/scopes/:scope_id/roles/:id');

  // group
  this.get('/scopes/:scope_id/groups');
  this.post('/scopes/:scope_id/groups');
  this.get('/scopes/:scope_id/groups/:id');
  this.patch('/scopes/:scope_id/groups/:id');
  this.del('/scopes/:scope_id/groups/:id');

  // Other resources
  // host-catalog

  this.get('/scopes/:scope_id/host-catalogs');
  this.post('/scopes/:scope_id/host-catalogs');
  this.get('/scopes/:scope_id/host-catalogs/:id');
  this.patch('/scopes/:scope_id/host-catalogs/:id');
  this.del('/scopes/:scope_id/host-catalogs/:id');

  // Uncomment the following line and the Response import above
  // Then change the response code to simulate error responses.
  // this.get('/scopes/:scope_id/projects', () => new Response(505));

  // Update error payload to simulate specific error responses.
  // this.get('/scopes/:scope_id/projects', () => new Response(505, {}, {
  //   errors: [{
  //     status: 505,
  //     message: 'HTTP version not supported.',
  //   }]
  // }));
}
