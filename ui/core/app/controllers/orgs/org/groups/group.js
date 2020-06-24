import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default class OrgsOrgGroupsGroupController extends Controller {
  // =attributes

  /**
   * @type {string}
   */
  @alias('model.name') breadCrumb;

}
