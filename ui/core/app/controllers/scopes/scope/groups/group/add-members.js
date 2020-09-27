import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeGroupsGroupAddMembersController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated new group breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.group.messages.add-members.title');
  }
}
