export default function(server) {

  // Scope resources

  server.createList('org', 3);
  server.createList('project', 6);

  // Auth

  // Auth methods exist both at the global scope and the org scope.
  // For simplicity we don't scope our mock auth methods and just return the
  // same items for request at all scopes.
  server.createList('auth-method', 3);

  // IAM
  // Roles
  server.createList('role', 5);

  // Other resources

  server.createList('host-catalog', 6);

}
