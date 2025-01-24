/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import GlobalPage from './globalPage.js';

export default class SessionPage {
  constructor(page) {
    this.page = page;
  }

  async cancelAllSessions() {
    while (
      (await this.page
        .getByRole('row')
        .filter({ hasNot: this.page.getByRole('columnheader') })
        .getByLabel('Cancel')
        .count()) > 0
    ) {
      await this.page
        .getByRole('row')
        .filter({ hasNot: this.page.getByRole('columnheader') })
        .getByLabel('Cancel')
        .first()
        .click();

      const globalPage = new GlobalPage(this.page);
      await globalPage.dismissSuccessAlert();
    }
  }
}
