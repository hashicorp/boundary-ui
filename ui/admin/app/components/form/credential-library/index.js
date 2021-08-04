import Component from '@glimmer/component';
import { options } from 'api/models/credential-library';
import { computed } from '@ember/object';

export default class FormCredentialLibraryIndexComponent extends Component {
  // =properties
  /**
   * @type {object}
   */
  httpMethodOptions = options.http_method;

  /**
   * Only allow HTTP request body field if http_method is set to POST.
   * @type {boolean}
   */
  @computed('args.model.attributes.http_method')
  get isHttpRequestBodyAllowed() {
    return this.args.model.attributes.http_method?.match(/post/i);
  }
}
