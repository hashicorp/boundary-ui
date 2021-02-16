export default function(server) {

  // Scope resources

  // creates a global scope
  const globalScope = server.create('scope', {
    id: 'global',
    type: 'global',
    name: 'Global'
  });
  const orgScope = server.createList('scope', 3, {
    type: 'org',
    scope: { id: globalScope.id, type: globalScope.type }
  }, 'withChildren')[0];

  server.create('user', { id: 'authenticateduser' });

  // Auth
  server.createList('auth-method', 2, { scope: globalScope }, 'withAccountsAndUsers');
  server.createList('auth-method', 3, { scope: orgScope }, 'withAccountsAndUsers');

  // Groups and Users
  server.createList('group', 1, { scope: globalScope }, 'withMembers');
  server.createList('group', 5, { scope: orgScope }, 'withMembers');
  // Role
  server.createList('role', 1, { scope: globalScope }, 'withPrincipals');
  server.createList('role', 5, { scope: orgScope }, 'withPrincipals');

  // Other resources
  server.schema.scopes.where({type: 'project'}).models.forEach(scope => {
    server.createList('host-catalog', 2, { scope }, 'withChildren');
    server.createList('target', 2, { scope }, 'withRandomHostSets');
    server.createList('session', 4, { scope }, 'withAssociations');
  });
}
