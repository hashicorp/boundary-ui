import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  // =services

  @service store;

  model() {
    this.store.findAll('scope');
  }
}
