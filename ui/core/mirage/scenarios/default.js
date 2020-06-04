export default function(server) {

  // Scope resources (org and project) have their relationship modelled.

  server.createList('project', 3);

  // For simplicity, other resources have their relationships modelled _except_
  // their relationships to scope.  These leads to the situation where the UI
  // displays _all subresources_ as if they belong to _every scope_.  This is
  // a tradeoff due to the complexity of relationship modelling.

  server.createList('host-catalog', 3);

}
