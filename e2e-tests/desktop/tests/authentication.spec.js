/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect, test } from '../fixtures/baseTest.js';
import LoginPage from '../pages/loginPage.js';

test.describe('user/password authentication tests', () => {
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

    // click dropdown
    await electronPage
      .getByRole('button', { name: 'admin' })
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

// Setup an LDAP server for these tests
test.fixme('LDAP authentication tests', async () => {
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
