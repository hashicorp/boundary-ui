/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { tracked } from '@glimmer/tracking';

/**
 * FilterOptions class to manage filter options state including
 * search query and available options with caching for all options.
 */
export default class FilterOptions {
  @tracked search;
  @tracked _options = [];
  #allOptions = new Map();

  get options() {
    return this._options;
  }

  set options(newOptions) {
    this._options = newOptions;
    newOptions.forEach((option) => {
      this.#allOptions.set(option.id, option);
    });
  }

  // Keep track of all filter options that are loaded so they can be
  // displayed in the selected filters regardless of search input
  get allOptions() {
    return Array.from(this.#allOptions.values());
  }
}
