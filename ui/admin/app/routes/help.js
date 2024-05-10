import Route from '@ember/routing/route';

export default class HelpRoute extends Route {
  // =attributes

  queryParams = {
    query: {
      refreshModel: true,
      replace: true,
    },
  };

  // =methods

  model({ query }) {
    return query;
  }
}
