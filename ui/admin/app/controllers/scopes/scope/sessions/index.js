import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
  STATUS_SESSION_CANCELING,
  statusTypes,
} from 'api/models/session';
import { action } from '@ember/object';
import { debounce } from 'core/decorators/debounce';

export default class ScopesScopeSessionsIndexController extends Controller {
  // =services

  @service store;
  @service intl;

  // =attributes

  queryParams = [
    'search',
    { users: { type: 'array' } },
    { targets: { type: 'array' } },
    { status: { type: 'array' } },
    'page',
    'pageSize',
  ];

  @tracked search = '';
  @tracked users = [];
  @tracked targets = [];
  @tracked status = [
    STATUS_SESSION_ACTIVE,
    STATUS_SESSION_PENDING,
    STATUS_SESSION_CANCELING,
  ];
  @tracked page = 1;
  @tracked pageSize = 10;

  get filters() {
    return {
      allFilters: {
        users: this.model.allUsers,
        targets: this.model.allTargets,
        status: this.sessionStatusOptions,
      },
      selectedFilters: {
        users: this.users,
        targets: this.targets,
        status: this.status,
      },
    };
  }

  /**
   * Returns all status types for sessions
   * @returns {[object]}
   */
  get sessionStatusOptions() {
    return statusTypes.map((status) => ({
      id: status,
      name: this.intl.t(`resources.session.status.${status}`),
    }));
  }

  // =actions

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
