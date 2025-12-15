/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect, test } from '../fixtures/baseTest.js';
import * as boundaryHttp from '../../helpers/boundary-http.js';
import SessionPage from '../pages/sessionPage.js';
import { textToMatch } from '../fixtures/tesseractTest.js';

let org;
let targetWithHost;
let sshTarget;
let sshTarget2;
let credential;

test.beforeEach(
  async ({ request, targetAddress, targetPort, sshUser, sshKeyPath }) => {
    org = await boundaryHttp.createOrg(request);
    const project = await boundaryHttp.createProject(request, org.id);

    // Create host set
    const hostCatalog = await boundaryHttp.createStaticHostCatalog(
      request,
      project.id,
    );
    const host = await boundaryHttp.createHost(request, {
      hostCatalogId: hostCatalog.id,
      address: targetAddress,
    });

    const hostSet = await boundaryHttp.createHostSet(request, hostCatalog.id);
    await boundaryHttp.addHostToHostSet(request, {
      hostSet,
      hostIds: [host.id],
    });

    // Create a static credential store and key pair credential
    const credentialStore = await boundaryHttp.createStaticCredentialStore(
      request,
      project.id,
    );
    credential = await boundaryHttp.createStaticCredentialKeyPair(request, {
      credentialStoreId: credentialStore.id,
      username: sshUser,
      sshKeyPath,
    });

    // Create tcp target with host set and 1 host
    targetWithHost = await boundaryHttp.createTarget(request, {
      scopeId: project.id,
      type: 'tcp',
      port: targetPort,
    });
    targetWithHost = await boundaryHttp.addHostSource(request, {
      target: targetWithHost,
      hostSourceIds: [hostSet.id],
    });
    targetWithHost = await boundaryHttp.addBrokeredCredentials(request, {
      target: targetWithHost,
      credentialIds: [credential.id],
    });

    // Create SSH targets with address
    sshTarget = await boundaryHttp.createTarget(request, {
      scopeId: project.id,
      type: 'ssh',
      port: targetPort,
      address: targetAddress,
    });
    sshTarget = await boundaryHttp.addInjectedCredentials(request, {
      target: sshTarget,
      credentialIds: [credential.id],
    });

    sshTarget2 = await boundaryHttp.createTarget(request, {
      scopeId: project.id,
      type: 'ssh',
      port: targetPort,
      address: targetAddress,
    });
    sshTarget2 = await boundaryHttp.addInjectedCredentials(request, {
      target: sshTarget2,
      credentialIds: [credential.id],
    });
  },
);

test.afterEach(async ({ request }) => {
  if (org) {
    await boundaryHttp.deleteOrg(request, org.id);
  }
});

test.describe('Sessions tests', () => {
  test('Establishes two different sessions and cancels them', async ({
    authedPage,
  }) => {
    // Connect to two targets
    await authedPage
      .getByRole('row', { name: sshTarget.name })
      .getByRole('link', { name: 'Connect' })
      .click();
    await expect(
      authedPage.getByRole('heading', { name: 'Sessions' }),
    ).toBeVisible();

    await authedPage.getByRole('link', { name: 'Targets' }).click();

    await authedPage
      .getByRole('row', { name: targetWithHost.name })
      .getByRole('link', { name: 'Connect' })
      .click();
    await expect(
      authedPage.getByRole('heading', { name: 'Sessions' }),
    ).toBeVisible();

    await authedPage.getByRole('link', { name: 'Sessions' }).click();

    await expect(
      authedPage
        .getByRole('row')
        .filter({ hasNot: authedPage.getByRole('columnheader') })
        .getByText('Pending'),
    ).toHaveCount(2);

    const sessionPage = new SessionPage(authedPage);
    await sessionPage.cancelAllSessions();

    await expect(
      authedPage
        .getByRole('row')
        .filter({ hasNot: authedPage.getByRole('columnheader') })
        .getByText('Canceling'),
    ).toHaveCount(2);
  });
});

test.describe('Filtering sessions tests', () => {
  test.beforeEach(async ({ authedPage }) => {
    // Connect to three targets
    await authedPage
      .getByRole('row', { name: sshTarget.name })
      .getByRole('link', { name: 'Connect' })
      .click();
    await expect(
      authedPage.getByRole('heading', { name: 'Sessions' }),
    ).toBeVisible();

    await authedPage.getByRole('link', { name: 'Targets' }).click();

    await authedPage
      .getByRole('row', { name: sshTarget2.name })
      .getByRole('link', { name: 'Connect' })
      .click();
    await expect(
      authedPage.getByRole('heading', { name: 'Sessions' }),
    ).toBeVisible();

    await authedPage.getByRole('link', { name: 'Targets' }).click();

    await authedPage
      .getByRole('row', { name: targetWithHost.name })
      .getByRole('link', { name: 'Connect' })
      .click();
    await expect(
      authedPage.getByRole('heading', { name: 'Sessions' }),
    ).toBeVisible();
    await authedPage.getByRole('link', { name: 'Sessions' }).click();

    await expect(
      authedPage
        .getByRole('row')
        .filter({ hasNot: authedPage.getByRole('columnheader') })
        .getByRole('cell', { name: 'Pending' }),
    ).toHaveCount(3);
  });

  test.afterEach(async ({ authedPage }) => {
    await authedPage.getByRole('button', { name: 'Clear Filters' }).click();
    await expect(
      authedPage.getByRole('button', { name: 'Clear Filters' }),
    ).toBeHidden();

    const sessionPage = new SessionPage(authedPage);
    await sessionPage.cancelAllSessions();

    await expect(
      authedPage
        .getByRole('row')
        .filter({ hasNot: authedPage.getByRole('columnheader') })
        .getByLabel('Cancel'),
    ).toHaveCount(0);
  });

  test('Filters by target', async ({ authedPage }) => {
    await authedPage.getByRole('button', { name: 'Target' }).click();
    await authedPage.getByLabel('Narrow results').fill(targetWithHost.name);
    await expect(authedPage.getByRole('checkbox')).toHaveCount(1);
    await authedPage.getByLabel(targetWithHost.name).check();
    await authedPage.getByRole('button', { name: 'Apply' }).click();

    await expect(
      authedPage
        .getByRole('row')
        .filter({ hasNot: authedPage.getByRole('columnheader') })
        .getByRole('cell', { name: 'Pending' }),
    ).toHaveCount(1);
    await expect(
      authedPage.getByRole('cell', { name: targetWithHost.name }),
    ).toBeVisible();
  });

  test('Filters by status', async ({ authedPage, tesseract }) => {
    await authedPage
      .getByRole('row', { name: sshTarget.name })
      .getByRole('link')
      .first()
      .click();
    await authedPage.getByRole('tab', { name: 'Shell' }).click();
    await expect(async () => {
      const screenshot = await authedPage.locator('.xterm-screen').screenshot();
      const result = await tesseract.recognize(screenshot);
      expect(result.data.text).toMatch(textToMatch);
    }).toPass();
    await authedPage.getByRole('link', { name: 'Sessions' }).click();

    await authedPage.getByRole('button', { name: 'Clear Filters' }).click();
    await expect(
      authedPage.getByRole('button', { name: 'Clear Filters' }),
    ).toBeHidden();
    await authedPage.getByRole('button', { name: 'Status' }).click();
    await authedPage.getByLabel('Active').check();
    await authedPage.getByRole('button', { name: 'Apply' }).click();

    await expect(
      authedPage
        .getByRole('row')
        .filter({ hasNot: authedPage.getByRole('columnheader') })
        .getByRole('cell', { name: 'Active' }),
    ).toHaveCount(1);
    await expect(
      authedPage.getByRole('cell', { name: sshTarget.name }),
    ).toBeVisible();

    await authedPage.getByRole('button', { name: 'Clear Filters' }).click();
    await expect(
      authedPage.getByRole('button', { name: 'Clear Filters' }),
    ).toBeHidden();
    await authedPage.getByRole('button', { name: 'Status' }).click();
    await authedPage.getByLabel('Pending').check();
    await authedPage.getByRole('button', { name: 'Apply' }).click();
    await expect(
      authedPage
        .getByRole('row')
        .filter({ hasNot: authedPage.getByRole('columnheader') })
        .getByRole('cell', { name: 'Pending' }),
    ).toHaveCount(2);
  });
});
