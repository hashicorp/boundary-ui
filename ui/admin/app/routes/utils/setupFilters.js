export function setupFilters(controller, route, queryParam) {
   const item= controller.controllerFor(route)[`filter-${queryParam}`];
   return item ? JSON.parse(item) : null
 }