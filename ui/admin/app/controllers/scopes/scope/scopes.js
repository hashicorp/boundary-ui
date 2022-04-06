import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default class ScopesScopeScopesController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * @type {string}
   */
  @computed('intl', 'model.currentScope.{isGlobal,isOrg}')
  get breadCrumb() {
    if (this.model.currentScope.isGlobal) {
      return this.intl.t('resources.org.title_plural');
    }
    /* istanbul ignore else */
    if (this.model.currentScope.isOrg) {
      return this.intl.t('resources.project.title_plural');
    }
    /* istanbul ignore next */
    return null;
  }
}
