/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debounce } from 'core/decorators/debounce';

export default class DropdownComponent extends Component {
  // =attributes

  @tracked selectedItems = [];
  @tracked searchTerm;

  /**
   * Takes itemOptions and filters them by searchTerm if there is one
   * and limits the number of items displayed in the dropdown to 500.
   * @returns {[object]}
   */
  get itemOptions() {
    let items = this.args.itemOptions;
    if (this.searchTerm) {
      const searchTerm = this.searchTerm.toLowerCase();
      items = this.args.itemOptions.filter((item) => {
        const isNameMatch = item.name?.toLowerCase().includes(searchTerm);
        const isIdMatch = item.id.includes(this.searchTerm);
        return isNameMatch || isIdMatch;
      });
    }
    return items.slice(0, 500);
  }

  // =methods

  /**
   * Sets searchTerm to be used for filtering itemOptions
   * @param {object} event
   */
  @action
  @debounce(150)
  filterItems(event) {
    const { value } = event.target;
    this.searchTerm = value;
  }

  /**
   * Handles checkbox event changes for selectedItems
   * @param {object} event
   */
  @action
  selectItem(item, event) {
    const { checked } = event.target;
    if (checked) {
      this.selectedItems = [...this.selectedItems, item];
    } else {
      if (this.args.isGrouped && item?.key && item?.value) {
        this.selectedItems = this.selectedItems.filter(
          (i) => !(i.key === item.key && i.value === item.value),
        );
      } else {
        this.selectedItems = this.selectedItems.filter((i) => i !== item);
      }
    }
  }

  /**
   * Pass selectedItems to applyFilter callback and call onClose
   * @param {function} close
   */
  @action
  applyFilter(onClose) {
    this.args.applyFilter(this.selectedItems);
    onClose();
  }

  /**
   * Sets selectedItems to checkedItems when the user opens
   * the dropdown and potentially has made changes
   * outside of the scope of dropdown
   */
  @action
  open() {
    this.selectedItems = [...this.args.checkedItems];
  }

  /**
   * Custom close method for dropdown that resets selectedItems
   * to checkedItems when the user closes the dropdown
   */
  @action
  close() {
    this.selectedItems = [...this.args.checkedItems];
    this.searchTerm = '';
  }
}
