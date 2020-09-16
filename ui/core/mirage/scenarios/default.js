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

  // Auth
  server.createList('auth-method', 3, { scope: globalScope });
  server.createList('auth-method', 3, { scope: orgScope }, 'withAccounts');

  // Groups and Users
  server.createList('group', 5, { scope: orgScope }, 'withMembers');
  // Role
  server.createList('role', 5, { scope: orgScope }, 'withPrincipals');

  // Other resources
  server.schema.scopes.where({type: 'project'}).models.forEach(scope => {
    server.createList('host-catalog', 2, { scope }, 'withChildren');
    server.createList('target', 2, { scope }, 'withRandomHostSets');
  });

}
