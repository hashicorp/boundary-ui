/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { TYPE_AUTH_METHOD_OIDC } from 'api/models/auth-method';

export default function (server) {
  // Scope resources

  // creates a global scope
  const globalScope = server.create('scope', {
    id: 'global',
    type: 'global',
    name: 'Global',
  });
  const orgScope = server.createList(
    'scope',
    3,
    {
      type: 'org',
      scope: { id: globalScope.id, type: globalScope.type },
    },
    'withChildren',
  )[0];

  // Auth
  const globalAuthMethods = server.createList(
    'auth-method',
    5,
    { scope: globalScope },
    'withAccountsAndUsersAndManagedGroups',
  );
  const orgAuthMethods = server.createList(
    'auth-method',
    3,
    { scope: orgScope },
    'withAccountsAndUsersAndManagedGroups',
  );
  // Authenticated user/account
  const user = server.create('user', {
    id: 'authenticateduser',
    scope: globalScope,
  });
  const { id: accountID } = server.create('account', {
    id: 'authenticatedaccount',
    scope: globalScope,
    authMethod: globalAuthMethods[0],
    type: 'password',
  });
  user.update({ accountIds: [accountID] });
  // Assign primary auth methods per scope
  // TODO make this generic
  globalScope.update({ primaryAuthMethodId: globalAuthMethods[0].id });
  orgScope.update({ primaryAuthMethodId: orgAuthMethods[1].id });

  // Groups and Users
  server.createList('group', 1, { scope: globalScope }, 'withMembers');
  server.createList('group', 5, { scope: orgScope }, 'withMembers');
  // Role
  const globalScopeRoles = server.createList(
    'role',
    1,
    { scope: globalScope },
    'withPrincipals',
  );
  //create managed groups for role/principals in globalScope
  globalScopeRoles.forEach((role) => {
    const { scope } = role;
    const oidcAuthMethod = globalAuthMethods.filter(
      (auth) => auth.type === TYPE_AUTH_METHOD_OIDC,
    )[0];
    const { type } = oidcAuthMethod;
    const managedGroups = server.createList('managed-group', 2, {
      scope,
      authMethodId: oidcAuthMethod.id,
      type,
    });
    role.update({ managedGroups });
  });

  const orgScopeRoles = server.createList(
    'role',
    5,
    { scope: orgScope },
    'withPrincipals',
  );
  //create managed groups for role/principals in orgScope
  orgScopeRoles.forEach((role) => {
    const { scope } = role;
    const oidcAuthMethod = orgAuthMethods.filter(
      (auth) => auth.type === TYPE_AUTH_METHOD_OIDC,
    )[0];
    const { type } = oidcAuthMethod;
    const managedGroups = server.createList('managed-group', 2, {
      scope,
      authMethodId: oidcAuthMethod.id,
      type,
    });
    role.update({ managedGroups });
  });

  // Storage Buckets
  server.createList('storage-bucket', 3, { scope: globalScope });
  server.createList('storage-bucket', 2, { scope: orgScope });

  // Storage Policies
  server.createList('policy', 3, { scope: globalScope });
  server.createList('policy', 3, { scope: orgScope });

  // Other resources
  server.schema.scopes.where({ type: 'project' }).models.forEach((scope) => {
    server.createList(
      'host-catalog',
      2,
      { scope, type: 'static' },
      'withChildren',
    );
    server.createList(
      'host-catalog',
      8,
      { scope, type: 'plugin' },
      'withChildren',
    );
    server.createList('credential-store', 5, { scope }, 'withAssociations');
    server.createList('target', 4, { scope }, 'withAssociations');
    server.create('target', { scope, address: '0.0.0.0' });
    // Sessions have target data. Create it after targets.
    server.createList('session', 4, { scope }, 'withAssociations');
    // Also create sessions for "authenticateduser" for Desktop,
    // which filters user_id by the currently authenticated user.
    server.createList('session', 1, { scope, user }, 'withAssociations');
    // Create IAM resources for project
    server.createList('group', 3, { scope });
    server.createList('role', 3, { scope });
  });

  // Aliases
  const aliasDestinationTarget = server.schema.targets.all().models[0];
  const { id: destination_id } = aliasDestinationTarget;
  const aliases = server.createList('alias', 4, {
    scope: globalScope,
    destination_id,
  });

  aliasDestinationTarget.update({
    aliases: aliases.map((alias) => ({ id: alias.id, value: alias.value })),
  });

  // Workers
  server.createList('worker', 3, { scope: globalScope });

  // Session Recordings
  server.createList(
    'session-recording',
    3,
    { scope: globalScope },
    'withConnectionAndChannels',
    'withExistingUserAndTarget',
  );
  server.create(
    'session-recording',
    { scope: globalScope },
    'withConnectionAndChannels',
    'withNonExistingUserAndTarget',
  );
  server.createList(
    'session-recording',
    2,
    { scope: orgScope },
    'withConnectionAndChannels',
    'withExistingUserAndTarget',
  );
}
