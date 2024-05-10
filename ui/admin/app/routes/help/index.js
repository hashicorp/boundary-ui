import Route from '@ember/routing/route';
import fetch from 'fetch';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';
import { action } from '@ember/object';

export default class HelpIndexRoute extends Route {
  // =methods

  async model() {
    const query = this.modelFor('help');
    if (query) {
      const config = getOwner(this).resolveRegistration('config:environment');
      const host = get(config, 'api.host');
      const namespace = get(config, 'api.namespace');

      const response = await fetch(`${host}/${namespace}/help`, {
        method: 'POST',
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    }
  }

  // =actions

  @action
  loading(transition) {
    /* eslint-disable-next-line ember/no-controller-access-in-routes */
    let controller = this.controllerFor('help');
    controller.set('currentlyLoading', true);
    transition.promise.finally(function () {
      controller.set('currentlyLoading', false);
    });
    return true;
  }
}
