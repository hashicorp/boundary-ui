/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { expect, test } from '../fixtures/baseTest.js';
import * as boundaryHttp from '../../helpers/boundary-http.js';
import { textToMatch } from '../fixtures/tesseractTest.js';
import {
  isRdpClientInstalled,
  isRdpRunning,
  killRdpProcesses,
  isOSForRdpSupported,
} from '../../helpers/rdp.js';

const hostName = 'Host name for test';
let org;
let targetWithHost;
let targetWithTwoHosts;
let sshTarget;
let credential;
let updCredential;
let rdpTarget;

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
    const host2 = await boundaryHttp.createHost(request, {
      hostCatalogId: hostCatalog.id,
      address: targetAddress,
      name: hostName,
    });

    const hostSet = await boundaryHttp.createHostSet(request, hostCatalog.id);
    await boundaryHttp.addHostToHostSet(request, {
      hostSet,
      hostIds: [host.id],
    });

    // Create a host set with 2 hosts
    let hostSetWithTwoHosts = await boundaryHttp.createHostSet(
      request,
      hostCatalog.id,
    );
    hostSetWithTwoHosts = await boundaryHttp.addHostToHostSet(request, {
      hostSet: hostSetWithTwoHosts,
      hostIds: [host.id],
    });
    hostSetWithTwoHosts = await boundaryHttp.addHostToHostSet(request, {
      hostSet: hostSetWithTwoHosts,
      hostIds: [host2.id],
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
    updCredential =
      await boundaryHttp.createStaticCredentialUsernamePasswordDomain(request, {
        credentialStoreId: credentialStore.id,
        username: sshUser,
        password: 'password',
        domain: 'domain',
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

    // Create tcp target with host set and 2 hosts
    targetWithTwoHosts = await boundaryHttp.createTarget(request, {
      scopeId: project.id,
      type: 'tcp',
      port: targetPort,
    });
    targetWithTwoHosts = await boundaryHttp.addHostSource(request, {
      target: targetWithTwoHosts,
      hostSourceIds: [hostSetWithTwoHosts.id],
    });
    targetWithTwoHosts = await boundaryHttp.addBrokeredCredentials(request, {
      target: targetWithTwoHosts,
      credentialIds: [credential.id],
    });

    // Create an SSH target with address
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

    // Create an RDP target and add host source and credential sources
    rdpTarget = await boundaryHttp.createTarget(request, {
      scopeId: project.id,
      type: 'rdp',
      port: 3389,
    });
    rdpTarget = await boundaryHttp.addHostSource(request, {
      target: rdpTarget,
      hostSourceIds: [hostSet.id],
    });
    rdpTarget = await boundaryHttp.addBrokeredCredentials(request, {
      target: rdpTarget,
      credentialIds: [updCredential.id],
    });
    rdpTarget = await boundaryHttp.addInjectedCredentials(request, {
      target: rdpTarget,
      credentialIds: [updCredential.id],
    });
  },
);

test.afterEach(async ({ request }) => {
  if (org) {
    await boundaryHttp.deleteOrg(request, org.id);
  }
});

test.describe('Targets tests', () => {
  test('Connects to a tcp target with one host', async ({ authedPage }) => {
    await authedPage.getByRole('link', { name: targetWithHost.name }).click();
    await authedPage.getByRole('button', { name: 'Connect' }).click();

    await expect(
      authedPage.getByRole('heading', { name: 'Sessions' }),
    ).toBeVisible();

    await expect(authedPage.getByText(credential.name)).toBeVisible();
    await expect(authedPage.getByText('username')).toBeVisible();
    await expect(authedPage.getByText('private_key')).toBeVisible();

    await authedPage
      .getByRole('listitem')
      .filter({ hasText: 'username' })
      .getByLabel('Toggle secret visibility')
      .click();
    await expect(
      authedPage
        .getByRole('listitem')
        .filter({ hasText: 'username' })
        .locator('pre'),
    ).toHaveText(credential.attributes.username);

    await authedPage
      .getByRole('listitem')
      .filter({ hasText: 'private_key' })
      .getByLabel('Toggle secret visibility')
      .click();
    await expect(
      authedPage
        .getByRole('listitem')
        .filter({ hasText: 'private_key' })
        .locator('pre'),
    ).toContainText(/BEGIN (OPENSSH|RSA) PRIVATE KEY/);

    await authedPage.getByRole('button', { name: 'End Session' }).click();
    await expect(authedPage.getByText('Canceled successfully.')).toBeVisible();
    await expect(
      authedPage.getByRole('heading', { name: 'Targets' }),
    ).toBeVisible();
  });

  [{ host: 'Quick Connect' }, { host: hostName }].forEach(({ host }) => {
    test(`Connects to a tcp target with two hosts using ${host}`, async ({
      authedPage,
    }) => {
      await authedPage
        .getByRole('link', { name: targetWithTwoHosts.name })
        .click();

      // eslint-disable-next-line playwright/no-conditional-in-test
      if (host === 'Quick Connect') {
        await authedPage.getByRole('button', { name: host }).click();
      } else {
        await authedPage
          .getByRole('row')
          .filter({ hasText: host })
          .getByRole('button', { name: 'Connect' })
          .click();
      }

      await expect(
        authedPage.getByRole('heading', { name: 'Sessions' }),
      ).toBeVisible();

      await expect(authedPage.getByText(credential.name)).toBeVisible();
      await expect(authedPage.getByText('username')).toBeVisible();
      await expect(authedPage.getByText('private_key')).toBeVisible();

      await authedPage
        .getByRole('listitem')
        .filter({ hasText: 'username' })
        .getByLabel('Toggle secret visibility')
        .click();
      await expect(
        authedPage
          .getByRole('listitem')
          .filter({ hasText: 'username' })
          .locator('pre'),
      ).toHaveText(credential.attributes.username);

      await authedPage
        .getByRole('listitem')
        .filter({ hasText: 'private_key' })
        .getByLabel('Toggle secret visibility')
        .click();
      await expect(
        authedPage
          .getByRole('listitem')
          .filter({ hasText: 'private_key' })
          .locator('pre'),
      ).toContainText(/BEGIN (OPENSSH|RSA) PRIVATE KEY/);

      await authedPage.getByRole('button', { name: 'End Session' }).click();
      await expect(
        authedPage.getByText('Canceled successfully.'),
      ).toBeVisible();
      await expect(authedPage).toHaveURL(
        /.*\/scopes\/global\/projects\/targets$/,
      );
    });
  });

  test('Connects to an SSH target', async ({ authedPage, tesseract }) => {
    await authedPage.getByRole('link', { name: sshTarget.name }).click();
    await authedPage.getByRole('button', { name: 'Connect' }).click();

    await expect(
      authedPage.getByRole('heading', { name: 'Sessions' }),
    ).toBeVisible();

    await authedPage.getByRole('tab', { name: 'Shell' }).click();

    await expect(async () => {
      const screenshot = await authedPage.locator('.xterm-screen').screenshot();
      const result = await tesseract.recognize(screenshot);
      expect(result.data.text).toMatch(textToMatch);
    }).toPass();

    await authedPage.getByRole('button', { name: 'End Session' }).click();
    await expect(authedPage.getByText('Canceled successfully.')).toBeVisible();

    await expect(
      authedPage.getByRole('heading', { name: 'Targets' }),
    ).toBeVisible();
  });

  test('Searches targets correctly', async ({ authedPage }) => {
    await authedPage.getByLabel('Search').fill(targetWithHost.name);

    await expect(
      authedPage
        .getByRole('row')
        .filter({ hasNot: authedPage.getByRole('columnheader') }),
    ).toHaveCount(1);
    await expect(
      authedPage.getByRole('link', { name: targetWithHost.name }),
    ).toBeVisible();
  });

  test('Launches RDP client when connecting to an RDP target', async ({
    authedPage,
  }) => {
    const isRdpClientInstalledCheck = await isRdpClientInstalled();
    const isOSForRdpSupportedCheck = await isOSForRdpSupported();

    test.skip(
      !isRdpClientInstalledCheck || !isOSForRdpSupportedCheck,
      'RDP client is not installed/supported on this system',
    );

    expect(isRdpRunning()).toBe(false);

    await authedPage.getByRole('link', { name: rdpTarget.name }).click();
    await authedPage.getByRole('button', { name: 'Open' }).click();

    await expect(
      authedPage.getByRole('heading', { name: 'Sessions' }),
    ).toBeVisible();

    expect(isRdpRunning()).toBe(true);

    await authedPage.getByRole('button', { name: 'End Session' }).click();
    await expect(authedPage.getByText('Canceled successfully.')).toBeVisible();

    killRdpProcesses();

    expect(isRdpRunning()).toBe(false);
  });
});
