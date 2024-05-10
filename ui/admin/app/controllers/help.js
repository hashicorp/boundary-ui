import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class HelpController extends Controller {
  // =services

  @service store;
  @service router;
  @service session;

  // =attributes
  queryParams = ['query'];

  @tracked query;

  /**
   * Handles the query queryParam
   * @param {object} event
   */
  @action
  handleSearchInput(event) {
    const { key } = event;
    const { value } = event.target;
    if (key === 'Enter') {
      this.query = value;
    } else if (!value) {
      this.query = '';
    }
  }
}
