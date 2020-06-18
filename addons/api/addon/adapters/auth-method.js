import ApplicationAdapter from './application';
import ScopeAdapterMixin from '../mixins/scope-adapter';

export default class AuthMethodAdapter extends ApplicationAdapter.extend(
  ScopeAdapterMixin
) {

  // =attributes

  /**
   * Auth method is scoped to org only.
   * @type {boolean}
   */
  includeProject = false;

}
