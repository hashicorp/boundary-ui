/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debounce } from 'core/decorators/debounce';

// TODO: Remove old Rose::Dropdown and rename this to Rose::Dropdown
export default class RoseFilterableDropdownComponent extends Component {
  // =attributes

  @tracked selectedItems = [];
  @tracked searchTerm;

  /**
   * Takes itemOptions and filters them by searchTerm if there is one
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
    return items;
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
  selectItem(event) {
    const { checked, value } = event.target;
    if (checked) {
      this.selectedItems = [...this.selectedItems, value];
    } else {
      this.selectedItems = this.selectedItems.filter(
        (scope) => scope !== value,
      );
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
   * Custom close method for dropdown that resets selectedItems
   * to checkedItems when the user closes the dropdown
   */
  @action
  close() {
    this.selectedItems = [...this.args.checkedItems];
    this.searchTerm = '';
  }
}
