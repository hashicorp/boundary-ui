import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TYPES_TARGET } from 'api/models/target';
import { action } from '@ember/object';
import { debounce } from 'core/decorators/debounce';

export default class ScopesScopeTargetsIndexController extends Controller {
  // =services

  @service intl;

  // =attributes

  queryParams = [
    'search',
    { availableSessions: { type: 'array' } },
    { types: { type: 'array' } },
    'page',
    'pageSize',
  ];

  @tracked search;
  @tracked scopes = [];
  @tracked availableSessions = [];
  @tracked types = [];
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked selectedTarget;

  get availableSessionOptions() {
    return [
      { id: 'yes', name: this.intl.t('actions.yes') },
      { id: 'no', name: this.intl.t('actions.no') },
    ];
  }

  get filters() {
    return {
      allFilters: {
        availableSessions: this.availableSessionOptions,
        types: this.targetTypeOptions,
      },
      selectedFilters: {
        availableSessions: this.availableSessions,
        types: this.types,
      },
    };
  }

  get targetTypeOptions() {
    return TYPES_TARGET.map((type) => ({
      id: type,
      name: this.intl.t(`resources.target.types.${type}`),
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
   * Sets the scopes query param to value of selectedScopes
   * to trigger a query and closes the dropdown
   * @param {function} close
   */
  @action
  applyFilter(paramKey, selectedItems) {
    this[paramKey] = [...selectedItems];
    this.page = 1;
  }
}