import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default class ScopesScopeScopesNewController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * @type {string}
   */
  @computed('intl', 'model.{currentScope,isOrg,isProject}')
  get breadCrumb() {
    if (this.model.isOrg) {
      return this.intl.t('resources.org.actions.create');
    }
    /* istanbul ignore else */
    if (this.model.isProject) {
      return this.intl.t('resources.project.actions.create');
    }
    /* istanbul ignore next */
    return null;
  }
}
