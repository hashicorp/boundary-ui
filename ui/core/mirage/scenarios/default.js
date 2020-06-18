export default function(server) {

  // Scope resources

  server.createList('org', 3);
  server.createList('project', 3);

  // Other resources

  server.createList('host-catalog', 3);

}
