import Ember from 'ember';
import config from '../config/environment';
import { authHandler, deauthHandler } from './route-handlers/auth';
import { pickRandomStatusString } from './factories/session';
import { Response } from 'miragejs';
import initializeMockIPC from './scenarios/ipc';

export default function () {
  initializeMockIPC(this);

  // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.urlPrefix = '';
  // make this `/api`, for example, if your API is namespaced
  this.namespace = config.api.namespace;
  // delay for each request, automatically set to 0 during testing
  this.timing = 1;

  // Allow any configured API host to passthrough, which is useful in
  // development for testing against a locally running backend.
  if (config.api.host) this.passthrough(`${config.api.host}/**`);
  this.passthrough();

  // Scope resources

  this.get(
    '/scopes',
    ({ scopes }, { queryParams: { scope_id, recursive } }) => {
      // Default parent scope is global
      if (!scope_id) scope_id = 'global';
      if (recursive && scope_id === 'global') {
        return scopes.all();
      } else {
        return scopes.where((scope) => {
          return scope.scope ? scope.scope.id === scope_id : false;
        });
      }
    }
  );
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

  this.get(
    '/auth-methods',
    ({ authMethods }, { queryParams: { scope_id: scopeId } }) => {
      return authMethods.where({ scopeId });
    }
  );
  this.post('/auth-methods');
  this.get('/auth-methods/:id');
  this.patch('/auth-methods/:id');
  this.del('/auth-methods/:id', ({ authMethods }, { params: { id } }) => {
    const authMethod = authMethods.find(id);
    const scope = authMethod.scope;
    authMethod.destroy();
    // If the primary auth method is deleted, the associated scope's
    // primary_auth_method_id field should be set to null.
    if (scope.primaryAuthMethodId === id) {
      scope.update({ primaryAuthMethodId: null });
    }
    return new Response(202);
  });

  // Auth Method Accounts
  this.get(
    '/accounts',
    ({ accounts }, { queryParams: { auth_method_id: authMethodId } }) => {
      return accounts.where({ authMethodId });
    }
  );
  this.post('/accounts');
  this.get('/accounts/:id');
  this.patch('/accounts/:id');
  this.del('/accounts/:id');
  this.post(
    '/accounts/:idMethod',
    function ({ accounts }, { params: { idMethod } }) {
      const attrs = this.normalizedRequestAttrs();
      const id = idMethod.split(':')[0];
      const method = idMethod.split(':')[1];
      const account = accounts.find(id);
      const updatedAttrs = {
        version: attrs.version,
        attributes: account.attributes,
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
    }
  );

  // Authenticate + auth methods custom routes
  this.post('/auth-methods/:id_method', authHandler);
  // Deauthenticate route
  this.post('/scopes/:id_method', deauthHandler);

  // IAM : Users
  this.get('/users', ({ users }, { queryParams: { scope_id: scopeId } }) => {
    return users.where({ scopeId });
  });
  this.post('/users');
  this.get('/users/:id');
  this.patch('/users/:id');
  this.del('/users/:id');
  this.post('/users/:idMethod', function ({ users }, { params: { idMethod } }) {
    const attrs = this.normalizedRequestAttrs();
    const id = idMethod.split(':')[0];
    const method = idMethod.split(':')[1];
    const user = users.find(id);
    const updatedAttrs = {
      version: attrs.version,
      accountIds: user.accountIds,
    };
    // If adding accounts, push them into the array
    if (method === 'add-accounts') {
      attrs.accountIds.forEach((id) => {
        if (!updatedAttrs.accountIds.includes(id)) {
          updatedAttrs.accountIds.push(id);
        }
      });
    }
    // If deleting accounts, filter them out of the array
    if (method === 'remove-accounts') {
      updatedAttrs.accountIds = updatedAttrs.accountIds.filter((id) => {
        return !attrs.accountIds.includes(id);
      });
    }
    return user.update(updatedAttrs);
  });

  // IAM: Groups
  this.get('/groups', ({ groups }, { queryParams: { scope_id: scopeId } }) => {
    return groups.where({ scopeId });
  });
  this.post('/groups');
  this.get('/groups/:id');
  this.patch('/groups/:id');
  this.del('/groups/:id');
  this.post(
    '/groups/:idMethod',
    function ({ groups }, { params: { idMethod } }) {
      const attrs = this.normalizedRequestAttrs();
      const id = idMethod.split(':')[0];
      const method = idMethod.split(':')[1];
      const group = groups.find(id);
      const updatedAttrs = {
        version: attrs.version,
        memberIds: group.memberIds,
      };
      // If adding members, push them into the array
      if (method === 'add-members') {
        attrs.memberIds.forEach((id) => {
          if (!updatedAttrs.memberIds.includes(id)) {
            updatedAttrs.memberIds.push(id);
          }
        });
      }
      // If deleting members, filter them out of the array
      if (method === 'remove-members') {
        updatedAttrs.memberIds = updatedAttrs.memberIds.filter((id) => {
          return !attrs.memberIds.includes(id);
        });
      }
      return group.update(updatedAttrs);
    }
  );

  // IAM: Roles
  this.get('/roles', ({ roles }, { queryParams: { scope_id: scopeId } }) => {
    return roles.where({ scopeId });
  });
  this.post('/roles');
  this.get('/roles/:id');
  this.patch('/roles/:id');
  this.del('/roles/:id');
  this.post(
    '/roles/:idMethod',
    function ({ roles, users, groups }, { params: { idMethod } }) {
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
          groupIds: role.groupIds,
        };
        attrs.principalIds.forEach((id) => {
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
          groupIds: role.groupIds,
        };
        updatedAttrs.userIds = updatedAttrs.userIds.filter((id) => {
          return !attrs.principalIds.includes(id);
        });
        updatedAttrs.groupIds = updatedAttrs.groupIds.filter((id) => {
          return !attrs.principalIds.includes(id);
        });
      }

      if (method === 'set-grants') {
        updatedAttrs = {
          version: attrs.version,
          grantStrings: attrs.grantStrings,
        };
      }

      return role.update(updatedAttrs);
    }
  );

  // Other resources
  // host-catalog

  this.get(
    '/host-catalogs',
    ({ hostCatalogs }, { queryParams: { scope_id: scopeId } }) => {
      return hostCatalogs.where({ scopeId });
    }
  );
  this.post('/host-catalogs');
  this.get('/host-catalogs/:id');
  this.patch('/host-catalogs/:id');
  this.del('/host-catalogs/:id');

  // host

  this.get(
    '/hosts',
    function ({ hosts }, { queryParams: { host_catalog_id: hostCatalogId } }) {
      return hosts.where({ hostCatalogId });
    }
  );
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

  this.get(
    '/host-sets',
    function (
      { hostSets },
      { queryParams: { host_catalog_id: hostCatalogId } }
    ) {
      return hostSets.where({ hostCatalogId });
    }
  );
  this.post('/host-sets', function ({ hostCatalogs, hostSets }) {
    const attrs = this.normalizedRequestAttrs();
    const hostCatalog = hostCatalogs.find(attrs.hostCatalogId);
    attrs.scopeId = hostCatalog.scope.id;
    return hostSets.create(attrs);
  });
  this.get('/host-sets/:id');
  this.patch('/host-sets/:id');
  this.del('/host-sets/:id');
  this.post(
    '/host-sets/:idMethod',
    function ({ hostSets }, { params: { idMethod } }) {
      const attrs = this.normalizedRequestAttrs();
      const id = idMethod.split(':')[0];
      const method = idMethod.split(':')[1];
      const hostSet = hostSets.find(id);
      const updatedAttrs = {
        version: attrs.version,
        hostIds: hostSet.hostIds,
      };

      // If adding hosts, push them into the array
      if (method === 'add-hosts') {
        attrs.hostIds.forEach((id) => {
          if (!updatedAttrs.hostIds.includes(id)) {
            updatedAttrs.hostIds.push(id);
          }
        });
      }

      // If deleting hosts, filter them out of the array
      if (method === 'remove-hosts') {
        updatedAttrs.hostIds = updatedAttrs.hostIds.filter((id) => {
          return !attrs.hostIds.includes(id);
        });
      }

      return hostSet.update(updatedAttrs);
    }
  );

  // target

  this.get(
    '/targets',
    function ({ targets }, { queryParams: { scope_id, recursive } }) {
      if (recursive && scope_id === 'global') {
        return targets.all();
      } else if (recursive) {
        return targets.where((target) => {
          const targetModel = targets.find(target.id);
          return (
            target.scopeId === scope_id ||
            targetModel?.scope?.scope?.id === scope_id
          );
        });
      }
      return targets.where((target) => target.scopeId === scope_id);
    }
  );
  this.post('/targets', function ({ targets }) {
    const attrs = this.normalizedRequestAttrs();
    return targets.create(attrs);
  });
  this.get('/targets/:id');
  this.patch('/targets/:id');
  this.del('/targets/:id');
  this.post(
    '/targets/:idMethod',
    function ({ targets }, { params: { idMethod } }) {
      const attrs = this.normalizedRequestAttrs();
      const id = idMethod.split(':')[0];
      const method = idMethod.split(':')[1];
      const target = targets.find(id);
      const updatedAttrs = {
        version: attrs.version,
      };
      // If adding host sets, push them into the array
      if (method === 'add-host-sets') {
        updatedAttrs.hostSetIds = target.hostSetIds;
        attrs.hostSetIds.forEach((id) => {
          if (!updatedAttrs.hostSetIds.includes(id)) {
            updatedAttrs.hostSetIds.push(id);
          }
        });
      }
      // If deleting host sets, filter them out of the array
      if (method === 'remove-host-sets') {
        updatedAttrs.hostSetIds = target.hostSetIds;
        updatedAttrs.hostSetIds = updatedAttrs.hostSetIds.filter((id) => {
          return !attrs.hostSetIds.includes(id);
        });
      }
      // If adding credential libraries, push them into the array
      if (method === 'add-credential-libraries') {
        updatedAttrs.credentialLibraryIds = target.credentialLibraryIds;
        attrs.applicationCredentialLibraryIds.forEach((id) => {
          if (!updatedAttrs.credentialLibraryIds.includes(id)) {
            updatedAttrs.credentialLibraryIds.push(id);
          }
        });
      }
      // If deleting credential libraries, filter them out of the array
      if (method === 'remove-credential-libraries') {
        updatedAttrs.credentialLibraryIds = target.credentialLibraryIds;
        updatedAttrs.credentialLibraryIds =
          updatedAttrs.credentialLibraryIds.filter((id) => {
            return !attrs.applicationCredentialLibraryIds.includes(id);
          });
      }
      return target.update(updatedAttrs);
    }
  );

  // session

  this.get(
    '/sessions',
    function ({ sessions }, { queryParams: { scope_id, recursive } }) {
      // To simulate changes to `session.status` that may occur in the backend,
      // we quietly randomize the value of the field on GET.
      // To populate sessions for logged in user,
      // update alternate sessions to auth user.
      // But only if not in testing mode.
      // In tests, we need deterministic statuses.
      if (!Ember.testing) {
        sessions.all().models.forEach((session) => {
          session.update({
            status: pickRandomStatusString(),
          });
          if (session.id.split('-').pop() % 2)
            session.update({
              userId: 'authenticateduser',
            });
        });
      }
      if (recursive && scope_id === 'global') {
        return sessions.all();
      } else if (recursive) {
        return sessions.where((session) => {
          const sessionModel = sessions.find(session.id);
          return (
            session.scopeId === scope_id ||
            sessionModel?.scope?.scope?.id === scope_id
          );
        });
      }
      return sessions.where((session) => session.scopeId === scope_id);
    }
  );
  this.get('/sessions/:id', function ({ sessions }, { params: { id } }) {
    const session = sessions.find(id);
    if (!Ember.testing) {
      session.update({
        status: pickRandomStatusString(),
      });
    }
    return session;
  });
  this.post(
    '/sessions/:idMethod',
    function ({ sessions }, { params: { idMethod } }) {
      const attrs = this.normalizedRequestAttrs();
      const id = idMethod.split(':')[0];
      const method = idMethod.split(':')[1];
      const session = sessions.find(id);
      const updatedAttrs = {
        version: attrs.version,
      };
      if (method === 'cancel') {
        updatedAttrs.status = 'canceling';
      }
      return session.update(updatedAttrs);
    }
  );

  // auth-tokens

  this.get('/auth-tokens/:id', function () {
    // Set to 401 or 404 to simulate token invalidation, which will
    // cause the session to fail restoration and logout the user.
    return new Response(200);
  });

  // credential-stores

  this.get(
    '/credential-stores',
    ({ credentialStores }, { queryParams: { scope_id: scopeId } }) =>
      credentialStores.where({ scopeId })
  );

  this.get('/credential-stores/:id');
  this.post('/credential-stores');
  this.patch('/credential-stores/:id');
  this.del('/credential-stores/:id');

  // credential-libraries

  this.get(
    '/credential-libraries',
    (
      { credentialLibraries },
      { queryParams: { credential_store_id: credentialStoreId } }
    ) => credentialLibraries.where({ credentialStoreId })
  );
  this.get('/credential-libraries/:id');
  this.post(
    '/credential-libraries',
    function ({ credentialStores, credentialLibraries }) {
      const attrs = this.normalizedRequestAttrs();
      const credentialStore = credentialStores.find(attrs.credentialStoreId);
      attrs.scopeId = credentialStore.scope.id;
      return credentialLibraries.create(attrs);
    }
  );
  this.del('/credential-libraries/:id');
  this.patch('/credential-libraries/:id');

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
