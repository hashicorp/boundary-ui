import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export function indexedDisplayName(intl, translation, array, item) {
  const length = array.length;

  let index = length - array.indexOf(item);
  if (index > length) index = null;

  return intl.t(translation, { index });
}

export default class IndexedDisplayName extends Helper {
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
    return indexedDisplayName(this.intl, translation, array, item);
  }
}
