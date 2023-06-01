/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

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
    'withChildren'
  )[0];

  // Auth
  const globalAuthMethods = server.createList(
    'auth-method',
    5,
    { scope: globalScope },
    'withAccountsAndUsersAndManagedGroups'
  );
  const orgAuthMethods = server.createList(
    'auth-method',
    3,
    { scope: orgScope },
    'withAccountsAndUsersAndManagedGroups'
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
    'withPrincipals'
  );
  //create managed groups for role/principals in globalScope
  globalScopeRoles.forEach((role) => {
    const { scope } = role;
    const oidcAuthMethod = globalAuthMethods.filter(
      (auth) => auth.type === 'oidc'
    )[0];
    const managedGroups = server.createList('managed-group', 2, {
      scope,
      authMethodId: oidcAuthMethod.id,
    });
    role.update({ managedGroups });
  });

  const orgScopeRoles = server.createList(
    'role',
    5,
    { scope: orgScope },
    'withPrincipals'
  );
  //create managed groups for role/principals in orgScope
  orgScopeRoles.forEach((role) => {
    const { scope } = role;
    const oidcAuthMethod = orgAuthMethods.filter(
      (auth) => auth.type === 'oidc'
    )[0];
    const managedGroups = server.createList('managed-group', 2, {
      scope,
      authMethodId: oidcAuthMethod.id,
    });
    role.update({ managedGroups });
  });

  // Storage Buckets
  server.createList('storage-bucket', 3, { scope: globalScope });
  server.createList('storage-bucket', 2, { scope: orgScope });

  // Other resources
  server.schema.scopes.where({ type: 'project' }).models.forEach((scope) => {
    server.createList('host-catalog', 8, { scope }, 'withChildren');
    server.createList('credential-store', 3, { scope }, 'withAssociations');
    server.createList('target', 2, { scope }, 'withAssociations');
    server.create('target', { scope, address: '0.0.0.0' });
    // Sessions have target data. Create it after targets.
    server.createList('session', 4, { scope }, 'withAssociations');
    // Create IAM resources for project
    server.createList('group', 3, { scope });
    server.createList('role', 3, { scope });
  });

  // Workers
  server.createList('worker', 3, { scope: globalScope });

  // Session Recordings
  server.createList(
    'session-recording',
    3,
    { scope: globalScope },
    'withConnectionAndChannels',
    'withExistingUserAndTarget'
  );
  server.create(
    'session-recording',
    { scope: globalScope },
    'withConnectionAndChannels',
    'withNonExistingUserAndTarget'
  );
  server.createList(
    'session-recording',
    2,
    { scope: orgScope },
    'withConnectionAndChannels',
    'withExistingUserAndTarget'
  );
}
