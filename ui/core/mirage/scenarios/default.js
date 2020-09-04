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
  const scopePojo = { id: orgScope.id, type: orgScope.type };

  // Auth
  server.createList('auth-method', 3, { scope: scopePojo });

  // Groups and Users
  server.createList('group', 5, { scope: scopePojo }, 'withMembers');
  // Role
  server.createList('role', 5, { scope: scopePojo }, 'withPrincipals');

  // Other resources
  server.schema.scopes.where({type: 'project'}).models.forEach(scope => {
    const scopePojo = { id: scope.id, type: scope.type };
    server.createList('host-catalog', 2, { scope: scopePojo }, 'withChildren');
    server.createList('target', 2, { scope }, 'withRandomHostSets');
  });

}
