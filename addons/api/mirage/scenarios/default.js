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

  server.create('user', { id: 'authenticateduser' });

  // Auth
  const globalAuthMethods = server.createList(
    'auth-method',
    1,
    { scope: globalScope },
    'withAccountsAndUsersAndManagedGroups'
  );
  const orgAuthMethods = server.createList(
    'auth-method',
    3,
    { scope: orgScope },
    'withAccountsAndUsersAndManagedGroups'
  );
  // Assign primary auth methods per scope
  // TODO make this generic
  globalScope.update({ primaryAuthMethodId: globalAuthMethods[0].id });
  orgScope.update({ primaryAuthMethodId: orgAuthMethods[1].id });

  // Groups and Users
  server.createList('group', 1, { scope: globalScope }, 'withMembers');
  server.createList('group', 5, { scope: orgScope }, 'withMembers');
  // Role
  server.createList('role', 1, { scope: globalScope }, 'withPrincipals');
  server.createList('role', 5, { scope: orgScope }, 'withPrincipals');

  // Other resources
  server.schema.scopes.where({ type: 'project' }).models.forEach((scope) => {
    server.createList('host-catalog', 2, { scope }, 'withChildren');
    server.createList('credential-store', 3, { scope }, 'withAssociations');
    server.createList('target', 2, { scope }, 'withAssociations');
    // Sessions have target data. Create it after targets.
    server.createList('session', 4, { scope }, 'withAssociations');
  });
}
