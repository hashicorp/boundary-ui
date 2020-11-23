import Ember from 'ember';
import config from '../config/environment';
import { authHandler, deauthHandler } from './route-handlers/auth';
import { pickRandomStatusString } from './factories/session';
import { Response } from 'miragejs';

export default function() {

  // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.urlPrefix = '';
  // make this `/api`, for example, if your API is namespaced
  this.namespace = config.api.namespace;

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
  this.get('/scopes/:id');

  // Auth & IAM resources

  this.get('/auth-methods', ({ authMethods }, { queryParams: { scope_id: scopeId } }) => {
    return authMethods.where({ scopeId });
  });
  this.get('/auth-methods/:id');

  // Auth Method Accounts
  this.get('/accounts', ({ accounts }, { queryParams: { auth_method_id: authMethodId } }) => {
    return accounts.where({ authMethodId });
  });
  this.get('/accounts/:id');
  this.post('/accounts/:idMethod', function ({ accounts }, { params: { idMethod } }) {
    const attrs = this.normalizedRequestAttrs();
    const id = idMethod.split(':')[0];
    const method = idMethod.split(':')[1];
    const account = accounts.find(id);
    const updatedAttrs = {
      version: attrs.version,
      attributes: account.attributes
    };
    // Set new password
    if (method === 'change-password') {
      updatedAttrs.attributes.password = attrs.new_password;
    }
    return account.update(updatedAttrs);
  });

  // Authenticate/deauthenticate routes
  this.post('/auth-methods/:id_method', authHandler);
  this.post('/scopes/:id_method', deauthHandler);

  // Other resources
  // host-catalog

  this.get('/host-catalogs', ({ hostCatalogs }, { queryParams: { scope_id: scopeId } }) => {
    return hostCatalogs.where({ scopeId });
  });
  this.get('/host-catalogs/:id');

  // host

  this.get('/hosts', function ({ hosts }, { queryParams: { host_catalog_id: hostCatalogId } }) {
    return hosts.where({ hostCatalogId });
  });
  this.get('/hosts/:id');

  // host-set

  this.get('/host-sets', function ({ hostSets }, { queryParams: { host_catalog_id: hostCatalogId } }) {
    return hostSets.where({ hostCatalogId });
  });
  this.get('/host-sets/:id');

  // target

  this.get('/targets', function ({ targets }, { queryParams: { scope_id } }) {
    return targets.where(target => target.scopeId === scope_id);
  });
  this.get('/targets/:id');

  // session

  this.get('/sessions', function ({ sessions }, { queryParams: { scope_id } }) {
    // To simulate changes to `session.status` that may occur in the backend,
    // we quietly randomize the value of the field on GET.
    // But only if not in testing mode.
    // In tests, we need deterministic statuses.
    if (!Ember.testing) {
      sessions.where(session => session.scopeId === scope_id)
        .models
        .forEach(session => session.update({
          status: pickRandomStatusString()
        }));
    }
    return sessions.where(session => session.scopeId === scope_id)
  });
  this.get('/sessions/:id', function ({ sessions }, { params: { id } }) {
    const session = sessions.find(id);
    return session.update({
      status: pickRandomStatusString()
    });
  });
  this.post('/sessions/:idMethod', function ({ sessions }, { params: { idMethod } }) {
    const attrs = this.normalizedRequestAttrs();
    const id = idMethod.split(':')[0];
    const method = idMethod.split(':')[1];
    const session = sessions.find(id);
    const updatedAttrs = {
      version: attrs.version
    };
    if (method === 'cancel') {
      updatedAttrs.status = 'canceling';
    }
    return session.update(updatedAttrs);
  });

  // auth-tokens

  this.get('/auth-tokens/:id', function () {
    // Set to 401 or 404 to simulate token invalidation, which will
    // cause the session to fail restoration and logout the user.
    return new Response(200);
  });

  /* Uncomment the following line and the Response import above
   * Then change the response code to simulate error responses.
   * this.get('/scopes', () => new Response(505));
   *
   * Update error payload to simulate specific error responses.
   */
  // this.get('/host-catalogs', () => new Response(404));
  // this.get('/scopes/:id', () => new Response(505, {}, {
  //   errors: [{
  //     status: 505,
  //     message: 'HTTP version not supported.',
  //   }]
  // }));
}
