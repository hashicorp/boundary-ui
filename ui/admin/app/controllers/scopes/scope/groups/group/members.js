import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeGroupsGroupMembersController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated users breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.group.messages.members.title');
  }
}
