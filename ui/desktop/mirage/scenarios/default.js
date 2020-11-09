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
  server.createList('auth-method', 1, { scope: globalScope }, 'withAccountsAndUsers');
  server.createList('auth-method', 3, { scope: orgScope }, 'withAccountsAndUsers');

  // Other resources
  server.schema.scopes.where({type: 'project'}).models.forEach(scope => {
    server.createList('host-catalog', 2, { scope }, 'withChildren');
    server.createList('target', 2, { scope }, 'withRandomHostSets');
    server.createList('session', 4, { scope }, 'withAssociations');
  });

}
