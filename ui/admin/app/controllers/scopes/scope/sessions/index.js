import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionsController extends Controller {
  // =services
  @service store;

  // =attributes

  get availableSessions() {
    return this.store.peekAll('session');
  }
}
