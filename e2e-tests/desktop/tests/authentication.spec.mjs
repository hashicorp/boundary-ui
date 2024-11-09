/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect, test } from "../fixtures/baseTest.mjs";
import LoginPage from "../pages/loginPage.mjs";

test.describe('user/password authentication tests', async () => {
  test('Authenticates and signs out', async ({
    electronPage,
    clusterUrl,
    username,
    password,
  }) => {
    const loginPage = new LoginPage(electronPage);
    await loginPage.setClusterUrl(clusterUrl);
    await loginPage.logInWithPassword(username, password);

    await expect(electronPage).toHaveURL(
      /.*\/scopes\/global\/projects\/targets$/,
    );

    await electronPage
      .locator('details')
      .filter({ hasText: 'Sign Out' })
      .click();

    await electronPage.getByRole('button', { name: 'Sign Out' }).click();
    await expect(electronPage).toHaveURL(/.*\/scopes\/global\/authenticate\//);
  });

  test('Fails to authenticate with wrong password', async ({
    electronPage,
    clusterUrl,
    username,
  }) => {
    const loginPage = new LoginPage(electronPage);
    await loginPage.setClusterUrl(clusterUrl);
    await loginPage.logInWithPassword(username, 'wrong password!!');

    await expect(electronPage).toHaveURL(/.*\/scopes\/global\/authenticate\//);
    await expect(electronPage.getByText('Authentication Failed')).toBeVisible();
  });
});

test.describe('LDAP authentication tests', async () => {
  test('Authenticates and signs out', async ({
    electronPage,
    clusterUrl,
    username,
    password,
  }) => {
    const loginPage = new LoginPage(electronPage);
    await loginPage.setClusterUrl(clusterUrl);
    await loginPage.logInWithLDAP(username, password);

    await expect(electronPage).toHaveURL(
      /.*\/scopes\/global\/projects\/targets$/,
    );

    await electronPage
      .locator('details')
      .filter({ hasText: 'Sign Out' })
      .click();

    await electronPage.getByRole('button', { name: 'Sign Out' }).click();
    await expect(electronPage).toHaveURL(/.*\/scopes\/global\/authenticate\//);
  });

  test('Fails to authenticate with wrong password', async ({
    electronPage,
    clusterUrl,
    username,
  }) => {
    const loginPage = new LoginPage(electronPage);
    await loginPage.setClusterUrl(clusterUrl);
    await loginPage.logInWithLDAP(username, 'wrong password!!');

    await expect(electronPage).toHaveURL(/.*\/scopes\/global\/authenticate\//);
    await expect(electronPage.getByText('Authentication Failed')).toBeVisible();
  });
});
