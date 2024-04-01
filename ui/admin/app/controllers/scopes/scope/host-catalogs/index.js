import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import {
  TYPES_HOST_CATALOG_PLUGIN,
  TYPES_HOST_CATALOG,
} from 'api/models/host-catalog';
import { action } from '@ember/object';
import { debounce } from 'core/decorators/debounce';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsIndexController extends Controller {
  // =services

  @service intl;

  // =attributes

  queryParams = [
    'search',
    { types: { type: 'array' } },
    { providers: { type: 'array' } },
    'page',
    'pageSize',
  ];

  @tracked search;
  @tracked types = [];
  @tracked providers = [];
  @tracked page = 1;
  @tracked pageSize = 10;

  get filters() {
    return {
      allFilters: {
        types: this.hostCatalogTypeOptions,
        providers: this.hostCatalogProviderOptions,
      },
      selectedFilters: {
        types: this.types,
        providers: this.providers,
      },
    };
  }

  get hostCatalogTypeOptions() {
    return TYPES_HOST_CATALOG.map((type) => ({
      id: type,
      name: this.intl.t(`resources.host-catalog.types.${type}`),
    }));
  }

  get hostCatalogProviderOptions() {
    return TYPES_HOST_CATALOG_PLUGIN.map((type) => ({
      id: type,
      name: this.intl.t(`resources.host-catalog.types.${type}`),
    }));
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
