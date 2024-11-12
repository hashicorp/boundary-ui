/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect, test } from '../fixtures/baseTest.js';

test.describe('Targets test', async () => {
  test('Connects to a target and ends session', async ({ authedPage }) => {
    await authedPage
      .getByRole('link', { name: 'Generated target with a direct address' })
      .click();

    await authedPage.getByRole('button', { name: 'Connect' }).click();

    await expect(authedPage).toHaveURL(
      /.*\/scopes\/global\/projects\/sessions/,
    );

    await authedPage.getByRole('button', { name: 'End Session' }).click();
    await expect(authedPage.getByText('Canceled successfully.')).toBeVisible();
    await expect(authedPage).toHaveURL(
      /.*\/scopes\/global\/projects\/targets$/,
    );
  });

  test('Searches targets correctly', async ({ authedPage }) => {
    await authedPage.getByLabel('Search').fill('hashicorp');

    // One row is the header
    await expect(authedPage.getByRole('row')).toHaveCount(2);
    await expect(
      authedPage.getByRole('link', { name: 'www.hashicorp.com' }),
    ).toBeVisible();
  });
});
