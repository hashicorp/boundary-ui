/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import {
  discoverEmberDataModels,
  applyEmberDataSerializers,
} from 'ember-cli-mirage';
import { createServer, Response } from 'miragejs';
import environmentConfig from '../config/environment';
import { authHandler, deauthHandler } from './route-handlers/auth';
import { targetHandler } from './route-handlers/target';
import { pickRandomStatusString } from './factories/session';
import initializeMockIPC from './scenarios/ipc';
import makeBooleanFilter from './helpers/bexpr-filter';
import { faker } from '@faker-js/faker';
import { asciiCasts } from './data/asciicasts';

const isTesting = environmentConfig.environment === 'test';

// Main function
// More info about server configuration https://www.ember-cli-mirage.com/docs/advanced/server-configuration
export default function (mirageConfig) {
  let finalConfig = {
    ...mirageConfig,
    models: { ...discoverEmberDataModels(), ...mirageConfig.models },
    serializers: applyEmberDataSerializers(mirageConfig.serializers),
    routes,
  };
  return createServer(finalConfig);
}

// Only routes are defined here
function routes() {
  initializeMockIPC(this, environmentConfig);

  this.passthrough();
  // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.urlPrefix = '';

  this.get('/metadata.json', () => {
    // this configuration is optional
    const licensedFeatures = environmentConfig?.features?.licensedFeatures;
    const edition = licensedFeatures ? 'enterprise' : 'oss';
    const features = licensedFeatures ? Object.keys(licensedFeatures) : [];
    const metadata = {
      license: {
        edition,
        features,
      },
    };
    return metadata;
  });

  // make this `/api`, for example, if your API is namespaced
  this.namespace = environmentConfig.api.namespace;
  // delay for each request, automatically set to 0 during testing
  this.timing = 1;

  // Scope resources

  this.get(
    '/scopes',
    ({ scopes }, { queryParams: { scope_id, recursive, filter } }) => {
      let resultSet;
      // Default parent scope is global
      if (!scope_id) scope_id = 'global';
      if (recursive && scope_id === 'global') {
        resultSet = scopes.all();
      } else {
        resultSet = scopes.where((scope) => {
          return scope.scope ? scope.scope.id === scope_id : false;
        });
      }
      return resultSet.filter(makeBooleanFilter(filter));
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
    ({ authMethods }, { queryParams: { scope_id, recursive, filter } }) => {
      let resultSet;
      if (recursive && scope_id === 'global') {
        resultSet = authMethods.all();
      } else if (recursive) {
        resultSet = authMethods.where((authMethod) => {
          const authMethodModel = authMethods.find(authMethod.id);
          return (
            authMethod.scopeId === scope_id ||
            authMethodModel?.scope?.scope?.id === scope_id
          );
        });
      } else {
        resultSet = authMethods.where(
          (authMethod) => authMethod.scopeId === scope_id
        );
      }
      return resultSet.filter(makeBooleanFilter(filter));
    }
  );
  this.post('/auth-methods', function ({ authMethods }) {
    const attrs = this.normalizedRequestAttrs();
    if (attrs.type === 'oidc') {
      attrs.attributes.state = 'active-public';
    }
    return authMethods.create(attrs);
  });
  this.get('/auth-methods/:id');
  this.patch(
    '/auth-methods/:id',
    function ({ authMethods }, { params: { id } }) {
      const attrs = this.normalizedRequestAttrs();
      if (attrs.type === 'oidc') {
        attrs.attributes.state = 'active-public';
      }

      return authMethods.find(id).update(attrs);
    }
  );
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
    (
      { accounts },
      { queryParams: { auth_method_id: authMethodId, filter } }
    ) => {
      let resultSet;
      if (authMethodId) {
        resultSet = accounts.where({ authMethodId });
      } else {
        resultSet = accounts.all();
      }
      return resultSet.filter(makeBooleanFilter(filter));
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
  this.delete('/auth-tokens/:id', deauthHandler);

  // IAM : Users
  this.get(
    '/users',
    ({ users }, { queryParams: { scope_id, recursive, filter } }) => {
      let resultSet;
      if (recursive && scope_id === 'global') {
        resultSet = users.all();
      } else if (recursive) {
        resultSet = users.where((user) => {
          const userModel = users.find(user.id);
          return (
            user.scopeId === scope_id ||
            userModel?.scope?.scope?.id === scope_id
          );
        });
      } else {
        resultSet = users.where((user) => user.scopeId === scope_id);
      }
      return resultSet.filter(makeBooleanFilter(filter));
    }
  );
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
  this.get(
    '/groups',
    ({ groups }, { queryParams: { scope_id, recursive, filter } }) => {
      let resultSet;
      if (recursive && scope_id === 'global') {
        resultSet = groups.all();
      } else if (recursive) {
        resultSet = groups.where((group) => {
          const groupModel = groups.find(group.id);
          return (
            group.scopeId === scope_id ||
            groupModel?.scope?.scope?.id === scope_id
          );
        });
      } else {
        resultSet = groups.where((group) => group.scopeId === scope_id);
      }
      return resultSet.filter(makeBooleanFilter(filter));
    }
  );
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
    function (
      { roles, users, groups, managedGroups },
      { params: { idMethod } }
    ) {
      const attrs = this.normalizedRequestAttrs();
      const id = idMethod.split(':')[0];
      const method = idMethod.split(':')[1];
      const role = roles.find(id);
      let updatedAttrs = {};

      // Principals is a combined list of users, groups and managed groups, but in Mirage we've
      // internally modelled them as separate lists.  Therefore we must check
      // the type by looking up the user or group first, then determine which
      // list to add the principal to.
      if (method === 'add-principals') {
        updatedAttrs = {
          version: attrs.version,
          userIds: role.userIds,
          groupIds: role.groupIds,
          managedGroupIds: role.managedGroupIds,
        };
        attrs.principalIds.forEach((id) => {
          const isUser = users.find(id);
          const isGroup = groups.find(id);
          const isManagedGroup = managedGroups.find(id);
          if (isUser && !updatedAttrs.userIds.includes(id)) {
            updatedAttrs.userIds.push(id);
          }
          if (isGroup && !updatedAttrs.groupIds.includes(id)) {
            updatedAttrs.groupIds.push(id);
          }
          if (isManagedGroup && !updatedAttrs.managedGroupIds.includes(id)) {
            updatedAttrs.managedGroupIds.push(id);
          }
        });
      }
      // If deleting principals, filter the ids out of users, groups and managed group lists,
      // and in this case don't care about the type
      if (method === 'remove-principals') {
        updatedAttrs = {
          version: attrs.version,
          userIds: role.userIds,
          groupIds: role.groupIds,
          managedGroupIds: role.managedGroupIds,
        };
        updatedAttrs.userIds = updatedAttrs.userIds.filter((id) => {
          return !attrs.principalIds.includes(id);
        });
        updatedAttrs.groupIds = updatedAttrs.groupIds.filter((id) => {
          return !attrs.principalIds.includes(id);
        });
        updatedAttrs.managedGroupIds = updatedAttrs.managedGroupIds.filter(
          (id) => {
            return !attrs.principalIds.includes(id);
          }
        );
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
  this.post(
    '/host-catalogs',
    function ({ hostCatalogs }, { queryParams: { plugin_name } }) {
      const attrs = this.normalizedRequestAttrs();
      if (plugin_name) {
        attrs.type = 'plugin';
        attrs.plugin = {
          name: plugin_name,
        };
      }
      return hostCatalogs.create(attrs);
    }
  );
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
    function ({ targets }, { queryParams: { scope_id, recursive, filter } }) {
      let resultSet;
      if (recursive && scope_id === 'global') {
        resultSet = targets.all();
      } else if (recursive) {
        resultSet = targets.where((target) => {
          const targetModel = targets.find(target.id);
          return (
            target.scopeId === scope_id ||
            targetModel?.scope?.scope?.id === scope_id
          );
        });
      } else {
        resultSet = targets.where((target) => target.scopeId === scope_id);
      }
      return resultSet.filter(makeBooleanFilter(filter));
    }
  );
  this.post('/targets', function ({ targets }) {
    const attrs = this.normalizedRequestAttrs();
    return targets.create(attrs);
  });
  this.get('/targets/:id');
  this.patch('/targets/:id');
  this.del('/targets/:id');
  this.post('/targets/:idMethod', targetHandler);

  // session

  this.get(
    '/sessions',
    function ({ sessions }, { queryParams: { scope_id, recursive, filter } }) {
      let resultSet;
      // To simulate changes to `session.status` that may occur in the backend,
      // we quietly randomize the value of the field on GET.
      // To populate sessions for logged in user,
      // update alternate sessions to auth user.
      // But only if not in testing mode.
      // In tests, we need deterministic statuses.
      if (!isTesting) {
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
        resultSet = sessions.all();
      } else if (recursive) {
        resultSet = sessions.where((session) => {
          const sessionModel = sessions.find(session.id);
          return (
            session.scopeId === scope_id ||
            sessionModel?.scope?.scope?.id === scope_id
          );
        });
      } else {
        resultSet = sessions.where((session) => session.scopeId === scope_id);
      }
      return resultSet.filter(makeBooleanFilter(filter));
    }
  );
  this.get('/sessions/:id', function ({ sessions }, { params: { id } }) {
    const session = sessions.find(id);
    if (!isTesting) {
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

  // credentials

  this.get(
    '/credentials',
    (
      { credentials },
      { queryParams: { credential_store_id: credentialStoreId } }
    ) => credentials.where({ credentialStoreId })
  );
  this.get('/credentials/:id');
  this.post('/credentials', function ({ credentialStores, credentials }) {
    const attrs = this.normalizedRequestAttrs();
    const credentialStore = credentialStores.find(attrs.credentialStoreId);
    attrs.scopeId = credentialStore.scope.id;
    return credentials.create(attrs);
  });

  this.del('/credentials/:id');
  this.patch('/credentials/:id');

  // managed-groups
  this.get(
    '/managed-groups',
    (
      { managedGroups },
      { queryParams: { auth_method_id: authMethodId, filter } }
    ) => {
      let resultSet;
      if (authMethodId) {
        resultSet = managedGroups.where({ authMethodId });
      } else {
        resultSet = managedGroups.all();
      }
      return resultSet.filter(makeBooleanFilter(filter));
    }
  );
  this.post('/managed-groups');
  this.get('/managed-groups/:id');
  this.patch('/managed-groups/:id');
  this.del('/managed-groups/:id');

  // workers
  this.get(
    '/workers',
    ({ workers }, { queryParams: { scope_id: scopeId } }) => {
      return workers.where({ scopeId });
    }
  );
  this.get('/workers/:id');
  this.del('/workers/:id');
  this.patch('/workers/:id');
  this.post('/workers:create:worker-led', ({ workers, scopes }) => {
    const globalScope = scopes.find('global');

    // This POST only takes in a token so we need to generate a random worker to return
    const newWorker = this.create('worker', {
      type: 'pki',
      scope: globalScope,
    });
    return workers.create(newWorker.attrs);
  });

  // storage-buckets
  this.get(
    '/storage-buckets',
    ({ storageBuckets }, { queryParams: { scope_id: scopeId, recursive } }) => {
      if (recursive && scopeId === 'global') {
        return storageBuckets.all();
      }
      return storageBuckets.where({ scopeId });
    }
  );
  this.get('/storage-buckets/:id');
  this.del('/storage-buckets/:id');
  this.patch('/storage-buckets/:id');
  this.post(
    '/storage-buckets',
    function ({ storageBuckets }, { queryParams: { plugin_name } }) {
      const attrs = this.normalizedRequestAttrs();
      if (plugin_name) {
        attrs.type = 'plugin';
        attrs.plugin = {
          name: plugin_name,
        };
      }

      // Remove the secrets and add the hmac in the response
      delete attrs.secrets;
      attrs.secrets_hmac = faker.git.commitSha();

      return storageBuckets.create(attrs);
    }
  );

  // session recordings
  this.get('/session-recordings');
  this.get(
    '/session-recordings/:idMethod',
    async ({ sessionRecordings }, { params: { idMethod } }) => {
      const id = idMethod.split(':')[0];
      const method = idMethod.split(':')[1];

      if (method === 'download') {
        return faker.helpers.arrayElement(asciiCasts);
      } else {
        return sessionRecordings.find(id);
      }
    }
  );

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
