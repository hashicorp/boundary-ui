import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';

export default class extends Helper {
  /**
   * Returns true if the controller for the specified route
   * has a value set for any field name passed into the helper.
   * @param {string} routeName
   * @param {string[]} names - names of controller fields
   * @return {boolean}
   */
  compute([routePath, ...names]) {
    const controller = getOwner(this).lookup(`controller:${routePath}`);
    assert(`Controller for route path ${routePath} must exist`, controller);
    for (let i in names) {
      if (controller[names[i]]) {
        return true;
      }
    }
    return false;
  }
}
