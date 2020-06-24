import ApplicationAdapter from './application';
import ScopeAdapterMixin from '../mixins/scope-adapter';

export default class RoleAdapter extends ApplicationAdapter.extend(
  ScopeAdapterMixin
) {
  // =attributes

  /**
   * Role is scoped to org only, for now.
   * @type {boolean}
   */
  includeProject = false;
}
