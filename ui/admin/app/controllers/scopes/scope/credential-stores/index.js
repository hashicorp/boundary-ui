import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from 'core/decorators/debounce';
import { TYPES_CREDENTIAL_STORE } from 'api/models/credential-store';

export default class ScopesScopeCredentialStoresIndexController extends Controller {
  // =services

  @service intl;

  // =attributes

  queryParams = ['search', { types: { type: 'array' } }, 'page', 'pageSize'];

  @tracked search;
  @tracked types = [];
  @tracked page = 1;
  @tracked pageSize = 10;

  get credStoreTypeOptions() {
    return TYPES_CREDENTIAL_STORE.map((type) => ({
      id: type,
      name: this.intl.t(`resources.credential-store.types.${type}`),
    }));
  }

  get filters() {
    return {
      allFilters: { types: this.credStoreTypeOptions },
      selectedFilters: { types: this.types },
    };
  }

  // =methods

  /**
   * Handles input on each keystroke and the search queryParam
   * @param {object} event
   */
  @action
  @debounce(250)
  handleSearchInput(event) {
    const { value } = event.target;
    this.search = value;
    this.page = 1;
  }

  /**
   * Sets a query param to the value of selectedItems
   * and resets the page to 1.
   * @param {string} paramKey
   * @param {[string]} selectedItems
   */
  @action
  applyFilter(paramKey, selectedItems) {
    this[paramKey] = [...selectedItems];
    this.page = 1;
  }
}
