/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { electronTest } from './electronTest.js';
import LoginPage from '../pages/loginPage.js';

export const authenticateTest = electronTest.extend({
  // TODO: Should we put these in a config file?
  clusterUrl: ({}, use) => {
    use(process.env.BOUNDARY_ADDR ?? 'http://localhost:9200');
  },
  username: ({}, use) => {
    use(process.env.E2E_PASSWORD_ADMIN_LOGIN_NAME ?? 'admin');
  },
  password: ({}, use) => {
    use(process.env.E2E_PASSWORD_ADMIN_PASSWORD ?? 'password');
  },
  authedPage: async ({ electronPage, clusterUrl, username, password }, use) => {
    const loginPage = new LoginPage(electronPage);
    await loginPage.setClusterUrl(clusterUrl);
    await loginPage.logInWithPassword(username, password);
    use(electronPage);
  },
});
