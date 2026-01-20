/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class RosePaginationComponent extends Component {
  @service router;

  /**
   * Returns the query params needed for the pagination component.
   * @returns {function(number, number): {pageSize: number, page: number}}
   */
  get paginationQueryParams() {
    return (page, pageSize) => {
      return {
        page,
        pageSize,
      };
    };
  }

  @action
  async handlePageSizeChange(pageSize) {
    // Reset to the first page when changing the page size
    const queryParams = { page: 1, pageSize };

    await this.router.transitionTo({ queryParams });
  }
}
