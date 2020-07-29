export default function(server) {

  // Scope resources

  const globalScope = server.create('scope', { id: 'global' });  // creates a global scope
  const orgScope = server.create('scope', {
    type: 'org',
    scope: { id: globalScope.id, type: globalScope.type }
  }, 'withChildren');

  const scope = { id: orgScope.id, type: orgScope.type };

  // Create additional scopes for authentication organization selection
  server.create('scope', {
    type: 'org',
    scope: { id: globalScope.id, type: globalScope.type }
  }, 'withChildren');

  server.create('scope', {
    type: 'org',
    scope: { id: globalScope.id, type: globalScope.type }
  }, 'withChildren');

  // Auth

  // Auth methods exist both at the global scope and the org scope.
  // For simplicity we don't scope our mock auth methods and just return the
  // same items for request at all scopes.
  server.createList('auth-method', 3, { scope });

  // User
  server.createList('user', 5, { scope });

  // Role
  server.createList('role', 5, { scope });
  // Groups
  server.createList('group', 5, { scope });

  // Other resources

  server.createList('host-catalog', 6);

}
