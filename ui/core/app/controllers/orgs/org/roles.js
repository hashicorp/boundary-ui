import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class OrgsOrgRolesController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.roles');
  }
}
