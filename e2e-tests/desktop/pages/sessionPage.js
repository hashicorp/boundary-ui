/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect } from '../fixtures/baseTest.js';
import BasePage from './basePage.js';

export default class SessionPage extends BasePage {
  async cancelAllSessions() {
    await expect
      .poll(
        async () => {
          await this.page
            .getByRole('row')
            .filter({ hasNot: this.page.getByRole('columnheader') })
            .getByLabel('Cancel')
            .first()
            .click();

          await this.dismissSuccessAlert();

          return await this.page
            .getByRole('row')
            .filter({ hasNot: this.page.getByRole('columnheader') })
            .getByLabel('Cancel')
            .count();
        },
        {
          message: 'Ensure all sessions are cancelled',
        },
      )
      .toBe(0);
  }
}
