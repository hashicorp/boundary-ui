import config from '../config/environment';
import { authHandler, deauthHandler } from './route-handlers/auth';
//import { Response } from 'miragejs';

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
    const results = scopes.where(scope => {
      return scope.scope ? scope.scope.id === scope_id : false
    });
    return results;
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
  this.get('/scopes/:id');
  this.patch('/scopes/:id');
  this.del('/scopes/:id');

  // Auth & IAM resources

  this.get('/scopes/:scope_id/auth-methods');
  this.post('/scopes/:scope_id/auth-methods');
  this.get('/scopes/:scope_id/auth-methods/:id');
  this.patch('/scopes/:scope_id/auth-methods/:id');
  this.del('/scopes/:scope_id/auth-methods/:id');

  // Authenticate/deauthenticate routes
  this.post('/scopes/:scope_id/auth-methods/:id_method', authHandler);
  this.post('/scopes/:id_method', deauthHandler);

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
  this.post('/scopes/:scope_id/roles/:id', function ({ roles }, request) {
    const attrs = this.normalizedRequestAttrs();
    const id = request.params.id.split(':')[0];
    const role = roles.find(id);
    attrs.id = id;
    return role.update(attrs);
  });

  // IAM: Groups
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

  // host

  this.get('/scopes/:scope_id/host-catalogs/:hostCatalogId/hosts', function ({ hosts }, { params: { hostCatalogId } }) {
    return hosts.where({ hostCatalogId });
  });
  this.post('/scopes/:scope_id/host-catalogs/:hostCatalogId/hosts', function ({ hosts }, { params: { hostCatalogId } }) {
    const attrs = this.normalizedRequestAttrs();
    attrs.hostCatalogId = hostCatalogId;
    return hosts.create(attrs);
  });
  this.get('/scopes/:scope_id/host-catalogs/:hostCatalogId/hosts/:id');
  this.patch('/scopes/:scope_id/host-catalogs/:hostCatalogId/hosts/:id');
  this.del('/scopes/:scope_id/host-catalogs/:hostCatalogId/hosts/:id');

  // host-set

  this.get('/scopes/:scope_id/host-catalogs/:hostCatalogId/host-sets', function ({ hostSets }, { params: { hostCatalogId } }) {
    return hostSets.where({ hostCatalogId });
  });
  this.post('/scopes/:scope_id/host-catalogs/:hostCatalogId/host-sets', function ({ hostSets }, { params: { hostCatalogId } }) {
    const attrs = this.normalizedRequestAttrs();
    attrs.hostCatalogId = hostCatalogId;
    return hostSets.create(attrs);
  });
  this.get('/scopes/:scope_id/host-catalogs/:hostCatalogId/host-sets/:id');
  this.patch('/scopes/:scope_id/host-catalogs/:hostCatalogId/host-sets/:id');
  this.del('/scopes/:scope_id/host-catalogs/:hostCatalogId/host-sets/:id');
  this.post('/scopes/:scope_id/host-catalogs/:hostCatalogId/host-sets/:idMethod', function ({ hostSets }, { params: { idMethod } }) {
    const attrs = this.normalizedRequestAttrs();
    const id = idMethod.split(':')[0];
    const hostSet = hostSets.find(id);
    attrs.id = id;
    return hostSet.update(attrs);
  });

  // target

  this.get('/scopes/:scope_id/targets');
  this.post('/scopes/:scope_id/targets');
  this.get('/scopes/:scope_id/targets/:id');
  this.patch('/scopes/:scope_id/targets/:id');
  this.del('/scopes/:scope_id/targets/:id');
  this.post('/scopes/:scope_id/targets/:idMethod', function ({ targets }, { params: { idMethod } }) {
    const attrs = this.normalizedRequestAttrs();
    const id = idMethod.split(':')[0];
    const method = idMethod.split(':')[1];
    const target = targets.find(id);
    const updatedAttrs = {
      version: attrs.version,
      hostSetIds: target.hostSetIds
    };
    // If adding host sets, push them into the array
    if (method === 'add-host-sets') {
      attrs.hostSetIds.forEach(id => {
        if (!updatedAttrs.hostSetIds.includes(id)) {
          updatedAttrs.hostSetIds.push(id);
        }
      });
    }
    // If deleting host sets, filter them out of the array
    if (method === 'delete-host-sets') {
      updatedAttrs.hostSetIds = updatedAttrs.hostSetIds.filter(id => {
        return !attrs.hostSetIds.includes(id);
      });
    }
    return target.update(updatedAttrs);
  });

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
