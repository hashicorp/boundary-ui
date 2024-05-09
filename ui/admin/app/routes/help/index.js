import Route from '@ember/routing/route';
import fetch from 'fetch';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';

export default class HelpIndexRoute extends Route {
  // =attributes

  queryParams = {
    query: {
      refreshModel: true,
      replace: true,
    },
  };

  // =methods

  async model({ query }) {
    if (query) {
      const config = getOwner(this).resolveRegistration('config:environment');
      const host = get(config, 'api.host');
      const namespace = get(config, 'api.namespace');
      const response = await fetch(`${host}/${namespace}/help`, {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      return response.json();
    }
  }
}
