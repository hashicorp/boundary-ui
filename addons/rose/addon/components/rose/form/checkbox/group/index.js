/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * A checkbox group represents an array of arbitrary items, which differs from
 * single checkboxes which represent boolean values.  When checkboxes within a
 * checkbox are toggled, their associated item is toggled within the group's
 * array value.
 *
 * The term "item" is used to disambiguate it from "value", which has an
 * existing meaning in the context of form fields.  However, items
 * are just arbitrary values.
 */
export default class RoseFormCheckboxGroupComponent extends Component {
  // =actions

  /**
   * Returns a new copy of the @selectedItems array where the given item is:
   *   - removed from the array, if it was already present
   *   - or added to the array, if it was not already present
   */
  @action
  toggleItem(item) {
    const selectedItems = this.args.selectedItems || [];
    const currentItems = [...selectedItems];

    if (this.hasSelectedItem(item)) {
      const i = this.getItemIndex(item);
      currentItems.splice(i, 1);
    } else {
      currentItems.push(item);
    }

    if (this.args.onChange) this.args.onChange(currentItems);
  }

  /**
   * Checks if the item is in the current selected items list.
   * If @itemEqualityFunc is not specified, will do a simple `includes` on the list.
   * @param item
   * @returns {boolean}
   */
  @action
  hasSelectedItem(item) {
    const currentItems = this.args.selectedItems || [];

    if (this.args.itemEqualityFunc) {
      return currentItems.some((element) =>
        this.args.itemEqualityFunc(element, item),
      );
    }

    return currentItems.includes(item);
  }

  /**
   * Finds the index of the item in the current selected items list
   * If @itemEqualityFunc is not specified, will use a simple `indexOf`.
   * @param item
   * @returns {number}
   */
  getItemIndex(item) {
    const currentItems = this.args.selectedItems || [];

    if (this.args.itemEqualityFunc) {
      return currentItems.findIndex((element) =>
        this.args.itemEqualityFunc(element, item),
      );
    }

    return currentItems.indexOf(item);
  }
}
