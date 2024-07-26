/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */
const { test } = require('./fixtures/baseTest');
const { expect } = require('@playwright/test');

test.describe.fixme('Settings Page tests', async () => {
  test('Authenticates using user and password method and signs out', async ({
    authedPage,
  }) => {
    await authedPage.getByRole('link', { name: 'Settings' }).click();
    await expect(authedPage).toHaveURL(
      /.*\/scopes\/global\/projects\/settings$/,
    );
  });
});
