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
  this.post('/scopes', function ({ scopes }) {
    // Parent scope comes through the payload via `scope_id`, but this needs
    // to be expanded to a scope object `scope: {id:..., type:...}` before
    // saving, which is the gist of this function.
    const attrs = this.normalizedRequestAttrs();
    const parentScopeAttrs = this.serialize(scopes.find(attrs.scopeId));
    attrs.scope = parentScopeAttrs;
    return scopes.create(attrs);
  });
  this.get('/scopes/:id');
  this.patch('/scopes/:id');
  this.del('/scopes/:id');

  // Auth & IAM resources

  this.get('/auth-methods', ({ authMethods }, { queryParams: { scope_id: scopeId } }) => {
    return authMethods.where({ scopeId });
  });
  this.post('/auth-methods');
  this.get('/auth-methods/:id');
  this.patch('/auth-methods/:id');
  this.del('/auth-methods/:id');

  // Auth Method Accounts
  this.get('/accounts', ({ accounts }, { queryParams: { auth_method_id: authMethodId } }) => {
    return accounts.where({ authMethodId });
  });
  this.post('/accounts');
  this.get('/accounts/:id');
  this.patch('/accounts/:id');
  this.del('/accounts/:id');
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
    if (method === 'set-password') {
      updatedAttrs.attributes.password = attrs.password;
    }
    // Set new password
    if (method === 'change-password') {
      updatedAttrs.attributes.password = attrs.new_password;
    }
    return account.update(updatedAttrs);
  });

  // Authenticate/deauthenticate routes
  this.post('/auth-methods/:id_method', authHandler);
  this.post('/scopes/:id_method', deauthHandler);

  // IAM : Users
  this.get('/users', ({ users }, { queryParams: { scope_id: scopeId } }) => {
    return users.where({ scopeId });
  });
  this.post('/users');
  this.get('/users/:id');
  this.patch('/users/:id');
  this.del('/users/:id');

  // IAM: Groups
  this.get('/groups', ({ groups }, { queryParams: { scope_id: scopeId } }) => {
    return groups.where({ scopeId });
  });
  this.post('/groups');
  this.get('/groups/:id');
  this.patch('/groups/:id');
  this.del('/groups/:id');
  this.post('/groups/:idMethod', function ({ groups }, { params: { idMethod } }) {
    const attrs = this.normalizedRequestAttrs();
    const id = idMethod.split(':')[0];
    const method = idMethod.split(':')[1];
    const group = groups.find(id);
    const updatedAttrs = {
      version: attrs.version,
      memberIds: group.memberIds
    };
    // If adding members, push them into the array
    if (method === 'add-members') {
      attrs.memberIds.forEach(id => {
        if (!updatedAttrs.memberIds.includes(id)) {
          updatedAttrs.memberIds.push(id);
        }
      });
    }
    // If deleting members, filter them out of the array
    if (method === 'remove-members') {
      updatedAttrs.memberIds = updatedAttrs.memberIds.filter(id => {
        return !attrs.memberIds.includes(id);
      });
    }
    return group.update(updatedAttrs);
  });

  // IAM: Roles
  this.get('/roles', ({ roles }, { queryParams: { scope_id: scopeId } }) => {
    return roles.where({ scopeId });
  });
  this.post('/roles');
  this.get('/roles/:id');
  this.patch('/roles/:id');
  this.del('/roles/:id');
  this.post('/roles/:idMethod', function ({ roles, users, groups }, { params: { idMethod } }) {
    const attrs = this.normalizedRequestAttrs();
    const id = idMethod.split(':')[0];
    const method = idMethod.split(':')[1];
    const role = roles.find(id);
    let updatedAttrs = {};

    // Principals is a combined list of users and groups, but in Mirage we've
    // internally modelled them as separate lists.  Therefore we must check
    // the type by looking up the user or group first, then determine which
    // list to add the principal to.
    if (method === 'add-principals') {
      updatedAttrs = {
        version: attrs.version,
        userIds: role.userIds,
        groupIds: role.groupIds
      };
      attrs.principalIds.forEach(id => {
        const isUser = users.find(id);
        const isGroup = groups.find(id);
        if (isUser && !updatedAttrs.userIds.includes(id)) {
          updatedAttrs.userIds.push(id);
        }
        if (isGroup && !updatedAttrs.groupIds.includes(id)) {
          updatedAttrs.groupIds.push(id);
        }
      });
    }
    // If deleting principals, filter them out of both users and groups,
    // and in this case don't care about the type
    if (method === 'remove-principals') {
      updatedAttrs = {
        version: attrs.version,
        userIds: role.userIds,
        groupIds: role.groupIds
      };
      updatedAttrs.userIds = updatedAttrs.userIds.filter(id => {
        return !attrs.principalIds.includes(id);
      });
      updatedAttrs.groupIds = updatedAttrs.groupIds.filter(id => {
        return !attrs.principalIds.includes(id);
      });
    }

    if (method === 'set-grants') {
      updatedAttrs = {
        version: attrs.version,
        grant_strings: attrs.grant_strings
      };
    }

    return role.update(updatedAttrs);
  });

  // Other resources
  // host-catalog

  this.get('/host-catalogs', ({ hostCatalogs }, { queryParams: { scope_id: scopeId } }) => {
    return hostCatalogs.where({ scopeId });
  });
  this.post('/host-catalogs');
  this.get('/host-catalogs/:id');
  this.patch('/host-catalogs/:id');
  this.del('/host-catalogs/:id');

  // host

  this.get('/hosts', function ({ hosts }, { queryParams: { host_catalog_id: hostCatalogId } }) {
    return hosts.where({ hostCatalogId });
  });
  this.post('/hosts', function ({ hostCatalogs, hosts }) {
    const attrs = this.normalizedRequestAttrs();
    const hostCatalog = hostCatalogs.find(attrs.hostCatalogId);
    attrs.scopeId = hostCatalog.scope.id;
    return hosts.create(attrs);
  });
  this.get('/hosts/:id');
  this.patch('/hosts/:id');
  this.del('/hosts/:id');

  // host-set

  this.get('/host-sets', function ({ hostSets }, { queryParams: { host_catalog_id: hostCatalogId } }) {
    return hostSets.where({ hostCatalogId });
  });
  this.post('/host-sets', function ({ hostCatalogs, hostSets }) {
    const attrs = this.normalizedRequestAttrs();
    const hostCatalog = hostCatalogs.find(attrs.hostCatalogId);
    attrs.scopeId = hostCatalog.scope.id;
    return hostSets.create(attrs);
  });
  this.get('/host-sets/:id');
  this.patch('/host-sets/:id');
  this.del('/host-sets/:id');
  this.post('/host-sets/:idMethod', function ({ hostSets }, { params: { idMethod } }) {
    const attrs = this.normalizedRequestAttrs();
    const id = idMethod.split(':')[0];
    const method = idMethod.split(':')[1];
    const hostSet = hostSets.find(id);
    const updatedAttrs = {
      version: attrs.version,
      hostIds: hostSet.hostIds
    }

    // If adding hosts, push them into the array
    if(method === 'add-hosts') {
      attrs.hostIds.forEach(id => {
        if(!updatedAttrs.hostIds.includes(id)) {
          updatedAttrs.hostIds.push(id);
        }
      })
    }

    // If deleting hosts, filter them out of the array
    if (method === 'remove-hosts') {
      updatedAttrs.hostIds = updatedAttrs.hostIds.filter(id => {
        return !attrs.hostIds.includes(id);
      });
    }

    return hostSet.update(updatedAttrs);
  });

  // target

  this.get('/targets', function ({ targets }, { queryParams: { scope_id } }) {
    return targets.where(target => target.scopeId === scope_id);
  });
  this.post('/targets', function ({ targets }) {
    const attrs = this.normalizedRequestAttrs();
    return targets.create(attrs);
  });
  this.get('/targets/:id');
  this.patch('/targets/:id');
  this.del('/targets/:id');
  this.post('/targets/:idMethod', function ({ targets }, { params: { idMethod } }) {
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
    if (method === 'remove-host-sets') {
      updatedAttrs.hostSetIds = updatedAttrs.hostSetIds.filter(id => {
        return !attrs.hostSetIds.includes(id);
      });
    }
    return target.update(updatedAttrs);
  });
}
