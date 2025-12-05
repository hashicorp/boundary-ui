import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAppTokensTokenRoute extends Route {
  @service store;

  async model(params) {
    // Fetch the app-token details using the token id and scope id
    return this.store.findRecord('app-token', params.token_id, {
      adapterOptions: { scope_id: params.scope_id },
    });
  }
}
