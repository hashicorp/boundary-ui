import ApplicationAdapter from './application';
import ScopeAdapterMixin from '../mixins/scope-adapter';

export default class ProjectAdapter extends ApplicationAdapter.extend(
  ScopeAdapterMixin
) {
  // =attributes

  /**
   * Project is scoped to org only, technically.
   * @type {boolean}
   */
  includeProject = false;
}
