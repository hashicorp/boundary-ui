import ApplicationAdapter from './application';
import ScopeAdapterMixin from '../mixins/scope-adapter';

export default class GroupAdapter extends ApplicationAdapter.extend(
  ScopeAdapterMixin
) {
  // =attributes

  /**
   * Group is scoped to org only, for now.
   * @type {boolean}
   */
  includeProject = false;
}
