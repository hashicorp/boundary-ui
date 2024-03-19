import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';

export default class extends Helper {
  /**
   * Returns true if the controller for the specified route
   * has a value set for any search or filter field.
   * @param {string} routeName
   * @return {boolean}
   */
  compute([routePath]) {
    const controller = getOwner(this).lookup(`controller:${routePath}`);
    assert(`Controller for route path ${routePath} must exist`, controller);

    for (const param of controller['queryParams']) {
      if (param !== 'page' && param !== 'pageSize') {
        const queryParam =
          typeof param === 'string' ? param : Object.keys(param)[0];
        const queryParamValue = controller[queryParam];
        if (queryParamValue && queryParamValue.length > 0) {
          return true;
        }
      }
    }
    return false;
  }
}
