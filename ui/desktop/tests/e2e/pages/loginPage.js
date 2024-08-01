/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable no-undef */

class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async setClusterUrl(clusterUrl) {
    await this.page.evaluate(() => localStorage.clear());
    await this.page.getByLabel('Cluster URL').fill(clusterUrl);
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }

  async logInWithPassword(username, password) {
    await this.page.getByLabel('Login Name').fill(username);
    await this.page.getByLabel('Password', { exact: true }).fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  async logInWithLDAP(username, password) {
    await this.page
      .getByRole('link', {
        name: 'Generated global scope initial ldap auth method',
      })
      .click();
    await this.logInWithPassword(username, password);
  }

  // Can't login with OIDC as we can't control the external browser that is opened
}

module.exports = LoginPage;
