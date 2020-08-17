export default function(server) {

  // Scope resources

  const globalScope = server.create('scope', { id: 'global' });  // creates a global scope
  const orgScope = server.createList('scope', 3, {
    type: 'org',
    scope: { id: globalScope.id, type: globalScope.type }
  }, 'withChildren')[0];
  const scope = { id: orgScope.id, type: orgScope.type };

  // Auth

  // Auth methods exist both at the global scope and the org scope.
  // For simplicity we don't scope our mock auth methods and just return the
  // same items for request at all scopes.
  server.createList('auth-method', 3, { scope });

  // User
  server.createList('user', 5, { scope });
  // Group
  server.createList('group', 5, { scope });
  // Role
  server.createList('role', 5, { scope }, 'withPrincipals');

  // Other resources

  server.db.scopes.where({type: 'project'}).forEach(({ id, type }) => {
    const scope = { id, type };
    server.createList('host-catalog', 2, { scope });
    // Hosts and host sets are supposed to be associated to a host catalog.
    // For simplicity of mocks, we don't actually associate them here.
    server.createList('host-set', 3, { scope });
    server.createList('host', 10, { scope });
  });

}
