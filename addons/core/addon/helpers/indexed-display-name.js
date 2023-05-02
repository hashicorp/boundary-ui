import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class extends Helper {
  // =services
  @service intl;

  // =methods
  /**
   *
   * @param {string} translation
   * @param {Array} array parent array of item
   * @param {object} item object that you want to find the index of
   * indexOf will not do a deep equality check with item, just if the object exist in the array
   * @returns localized name for resource with indexed position. For example, "Channel 1" for first item in a list.
   */
  compute([translation, array, item]) {
    let index = array.indexOf(item) + 1;
    if (index === 0) {
      index = null;
    }
    return this.intl.t(translation, { index });
  }
}
