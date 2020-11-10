import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  // =services

  @service ipc;

  // =methods

  /**
   * Invokes an IPC method and returns the result.
   * @return {Promise}
   */
  model() {
    return this.ipc.invoke('getFoobars', {
      id: '1'
    });
  }

  /**
   * Redirects to scopes route for further processing.
   */
  redirect() {
    this.transitionTo('scopes');
  }
}
