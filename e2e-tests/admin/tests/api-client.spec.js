/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5);
const scopeId = 'global';
const aliasCleanedUpDescription = 'this alias should be cleaned up';
const aliasSkippedDescription = 'this alias should not be cleaned up';

test('resources can be created (example: alias)', async ({ apiClient }) => {
  await apiClient.clients.Alias.aliasServiceCreateAlias({
    item: {
      scopeId,
      description: aliasCleanedUpDescription,
      value: `a-${nanoid(4)}.dev`,
      type: 'target',
    },
  });

  const skipAlias = await apiClient.clients.Alias.aliasServiceCreateAlias({
    item: {
      scopeId,
      description: aliasSkippedDescription,
      value: `b-${nanoid(4)}.dev`,
      type: 'target',
    },
  });

  apiClient.skipCleanup(skipAlias);

  const aliases = await apiClient.clients.Alias.aliasServiceListAliases({
    scopeId,
  });
  const cleanedUpAlias = aliases.items.find(
    ({ description }) => description === aliasCleanedUpDescription,
  );
  expect(cleanedUpAlias).toBeTruthy();
  const cleanUpSkippedAlias = aliases.items.find(
    ({ description }) => description === aliasSkippedDescription,
  );
  expect(cleanUpSkippedAlias).toBeTruthy();
});

// it is an anti-pattern for this test to depend on the previously ran test.
// this is to test that the fixture runs and the clean up is handled correctly
test('resources not marked to be skipped from previous test are cleaned up', async ({
  apiClient,
}) => {
  const aliases = await apiClient.clients.Alias.aliasServiceListAliases({
    scopeId,
  });
  const cleanedUpAlias = aliases.items.find(
    ({ description }) => description === aliasCleanedUpDescription,
  );
  expect(cleanedUpAlias).toBeFalsy();
  const cleanUpSkippedAlias = aliases.items.find(
    ({ description }) => description === aliasSkippedDescription,
  );
  expect(cleanUpSkippedAlias).toBeTruthy();

  // manually clean up skipped resource
  await apiClient.clients.Alias.aliasServiceDeleteAlias({
    id: cleanUpSkippedAlias.id,
  });
});

test('it logs the response when an error is returned from an api call', async ({
  apiClient,
}) => {
  const consoleErrors = [];
  const originalConsoleError = console.error;
  console.error = (toLog) => {
    consoleErrors.push(toLog);
  };

  await apiClient.clients.Alias.aliasServiceListAliases({
    scopeId: 'not a valid scope id',
    // this request is expected to fail and throw
  }).catch(() => {});

  expect(consoleErrors).toHaveLength(1);
  expect(consoleErrors[0]).toContain(
    'Error response from Boundary API, status code: 400, with method: GET',
  );
  expect(consoleErrors[0]).toContain('Improperly formatted identifier.');

  // restore the original console.error
  console.error = originalConsoleError;
});

test('it throws when #skipCleanup is given an object without an id', ({
  apiClient,
}) => {
  expect(() =>
    apiClient.skipCleanup('not an object with an id property'),
  ).toThrow('The `id` field is expected on the resource');
});
