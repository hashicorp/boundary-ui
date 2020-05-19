import RESTAdapter from '@ember-data/adapter/rest';
import config from 'ember-get-config';
import { get } from '@ember/object';

export default class ApplicationAdapter extends RESTAdapter {
  // =attributes

  /**
   * Sets namespace to the `api.namespace` string in the application's config,
   * if set.
   * @type {string}
   */
  namespace = get(config, 'api.namespace');
}
