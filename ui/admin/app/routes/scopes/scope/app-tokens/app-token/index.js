import Route from '@ember/routing/route';

export default class ScopesScopeAppTokensAppTokenIndexRoute extends Route {
  queryParams = {
    showCreatedAppToken: {
      replace: true,
    },
  };
}
