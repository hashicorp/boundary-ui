/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { expect } = require('@playwright/test');

class SessionsPage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Waits for the session to appear and be in Active state.
   * @param {string} targetName Name of the target associated with the session
   */
  async waitForSessionToBeVisible(targetName) {
    await this.page
      .getByRole('navigation', { name: 'Resources' })
      .getByRole('link', { name: 'Sessions' })
      .click();
    await expect(
      this.page
        .getByRole('navigation', { name: 'breadcrumbs' })
        .getByText('Sessions'),
    ).toBeVisible();
    let i = 0;
    let sessionIsVisible = false;
    let sessionIsActive = false;
    do {
      i = i + 1;
      sessionIsVisible = await this.page
        .getByRole('cell', { name: targetName })
        .isVisible();
      sessionIsActive = await this.page
        .getByRole('cell', { name: 'Active' })
        .isVisible();
      if (sessionIsVisible && sessionIsActive) {
        break;
      }

      const noSessionsAvailable = await this.page
        .getByText('No Sessions Available', { exact: true })
        .isVisible();
      if (noSessionsAvailable) {
        await new Promise((r) => setTimeout(r, 1000));
        await this.page.reload();
      } else {
        await this.page.getByRole('button', { name: 'Refresh' }).click();
        await expect(
          this.page.getByRole('button', { name: 'Refresh' }),
        ).toBeEnabled();
      }
    } while (i < 5);

    if (!sessionIsVisible) {
      throw new Error('Session is not visible');
    }
  }
}

module.exports = SessionsPage;
