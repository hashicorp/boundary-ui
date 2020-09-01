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
  const globalScopeConfig = { scope: { id: globalScope.id, type: globalScope.type } };
  const scope = { id: orgScope.id, type: orgScope.type };

  // Auth

  // Auth methods exist both at the global scope and the org scope.
  // For simplicity we don't scope our mock auth methods and just return the
  // same items for request at all scopes.
  server.createList('auth-method', 3, { scope });

  // User
  server.createList('user', 5, { scope });
  server.createList('user', 2, globalScopeConfig);
  // Group
  server.createList('group', 5, { scope });
  // Role
  server.createList('role', 5, { scope }, 'withPrincipals');

  // Other resources

  server.db.scopes.where({type: 'project'}).forEach(({ id, type }) => {
    const scope = { id, type };
    server.createList('host-catalog', 2, { scope }, 'withChildren');
    server.createList('target', 2, { scope }, 'withRandomHostSets');
  });

}
