/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test as base } from '../../global-setup.js';
import { expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

import * as boundaryCli from '../../helpers/boundary-cli';
import { readFile } from 'fs/promises';

// These tests are to make sure that the api-client fixture works as expected.
// Test helpers or fixtures don't always have tests, but because this one has
// enough complexity it's worth testing

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5);
const scopeId = 'global';
const aliasCleanedUpDescription = `this alias should be cleaned up ${nanoid()}`;
const aliasSkippedDescription = `this alias should not be cleaned up ${nanoid()}`;

const test = base.extend(
  {
    apiClientTestAfter: async ({}, use) => {
      let apiClientTestAfter;
      const setapiClientTestAfter = (fn) => {
        apiClientTestAfter = fn;
      };
      await use(setapiClientTestAfter);
      await apiClientTestAfter?.();
    },
  },
  { scope: 'test', auto: true },
);

test(
  'resources can be created (example: alias)',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({ apiClient, apiClientTestAfter }) => {
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

    // These assertions ensure that by the end of this test the two aliases
    // exist. In the next test they are checked to see if clean up and
    // skipping clean up worked correctly
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

    apiClientTestAfter(async () => {
      const aliases = await apiClient.clients.Alias.aliasServiceListAliases({
        scopeId,
      });
      const cleanedUpAlias = aliases.items.find(
        ({ description }) => description === aliasCleanedUpDescription,
      );
      // the `cleanedUpAlias` has been cleaned up so it isn't expected to be found
      expect(cleanedUpAlias).toBeFalsy();
      const cleanUpSkippedAlias = aliases.items.find(
        ({ description }) => description === aliasSkippedDescription,
      );
      // the `cleanUpSkippedAlias` skipped cleanup so it should still exist
      expect(cleanUpSkippedAlias).toBeTruthy();

      // manually clean up skipped resource
      await apiClient.clients.Alias.aliasServiceDeleteAlias({
        id: cleanUpSkippedAlias.id,
      });
    });
  },
);

test(
  'it logs the response when an error is returned from an api call',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  async ({ apiClient }) => {
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
  },
);

test(
  'it throws when #skipCleanup is given an object without an id',
  { tag: ['@ce', '@ent', '@aws', '@docker'] },
  ({ apiClient }) => {
    expect(() =>
      apiClient.skipCleanup('not an object with an id property'),
    ).toThrow('The `id` field is expected on the resource');
  },
);

// This test serves as a more complex example and exercises many connected resources.
// It also serves to illustrate that there are some resources, like storage buckets,
// that may be dependent on other resources created outside the api being cleaned up first,
// like sessions being cancelled and session recordings being deleted. Once these are
// cleaned up then automatic clean up should work.
test(
  'Storage buckets can be cleaned up after a session is manually cancelled and session recordings are manually deleted',
  { tag: ['@ent', '@docker'] },
  async ({
    controllerAddr,
    adminAuthMethodId,
    adminLoginName,
    adminPassword,
    bucketAccessKeyId,
    bucketEndpointUrl,
    bucketName,
    bucketSecretAccessKey,
    region,
    sshUser,
    sshKeyPath,
    targetAddress,
    targetPort,
    workerTagEgress,
    apiClient,
    apiClientTestAfter,
  }) => {
    await boundaryCli.checkBoundaryCli();

    let connect;
    try {
      await boundaryCli.authenticateBoundary(
        controllerAddr,
        adminAuthMethodId,
        adminLoginName,
        adminPassword,
      );

      const org = await apiClient.clients.Scope.scopeServiceCreateScope({
        item: {
          name: `Org-${nanoid()}`,
          scopeId: 'global',
        },
      });

      const project = await apiClient.clients.Scope.scopeServiceCreateScope({
        item: {
          name: `Project-${nanoid()}`,
          scopeId: org.id,
        },
      });

      const storageBucket =
        await apiClient.clients.StorageBucket.storageBucketServiceCreateStorageBucket(
          {
            pluginName: 'minio',
            item: {
              scopeId: org.scopeId,
              bucketName,
              workerFilter: `"${workerTagEgress}" in "/tags/type"`,
              attributes: {
                region,
                endpoint_url: bucketEndpointUrl,
                disable_credential_rotation: true,
              },
              secrets: {
                access_key_id: bucketAccessKeyId,
                secret_access_key: bucketSecretAccessKey,
              },
            },
          },
        );

      const target = await apiClient.clients.Target.targetServiceCreateTarget({
        item: {
          name: `ssh-target-${nanoid()}`,
          scopeId: project.id,
          type: 'ssh',
          address: targetAddress,
          ingressWorkerFilter: `"${workerTagEgress}" in "/tags/type"`,
          egressWorkerFilter: `"${workerTagEgress}" in "/tags/type"`,
          attributes: {
            default_port: targetPort,
            enable_session_recording: true,
            storage_bucket_id: storageBucket.id,
          },
        },
      });

      const credentialStore =
        await apiClient.clients.CredentialStore.credentialStoreServiceCreateCredentialStore(
          {
            item: {
              scopeId: project.id,
              type: 'static',
            },
          },
        );

      const keyData = await readFile(sshKeyPath, {
        encoding: 'utf-8',
      });

      const credential =
        await apiClient.clients.Credential.credentialServiceCreateCredential({
          item: {
            credentialStoreId: credentialStore.id,
            type: 'ssh_private_key',
            attributes: {
              username: sshUser,
              private_key: keyData,
            },
          },
        });

      await apiClient.clients.Target.targetServiceAddTargetCredentialSources({
        id: target.id,
        body: {
          injectedApplicationCredentialSourceIds: [credential.id],
          version: 1,
        },
      });

      const storagePolicy =
        await apiClient.clients.Policy.policyServiceCreatePolicy({
          item: {
            type: 'storage',
            scopeId: 'global',
            attributes: {
              delete_after: { days: 1 },
            },
          },
        });

      apiClient.clients.Scope.scopeServiceAttachStoragePolicy({
        id: org.id,
        body: {
          storagePolicyId: storagePolicy.id,
          version: 1,
        },
      });

      connect = await boundaryCli.connectSshToTarget(target.id);

      let waitForSessionCount = 0;
      let sshSession;
      while (!sshSession) {
        const sessions =
          await apiClient.clients.Session.sessionServiceListSessions({
            scopeId: target.scopeId,
          });

        sshSession = sessions?.items.find(
          (session) =>
            session.status === 'active' && session.targetId === target.id,
        );

        if (waitForSessionCount >= 20) {
          throw new Error(
            'Max attempts exceeded waiting for target to session to be created',
          );
        }

        // avoid being rate limited
        await new Promise((r) => setTimeout(r, 500));
        waitForSessionCount++;
      }

      await apiClient.clients.Session.sessionServiceCancelSession({
        id: sshSession.id,
        body: {
          version: sshSession.version,
        },
      });

      let waitForSessionRecordingCount = 0;
      let completedSessionRecording;
      while (!completedSessionRecording) {
        completedSessionRecording = (
          await apiClient.clients.SessionRecording.sessionRecordingServiceListSessionRecordings(
            {
              scopeId: 'global',
              recursive: true,
            },
          )
        ).items.find(
          (recording) =>
            recording.sessionId === sshSession.id &&
            recording.state === 'available',
        );

        // Session recordings have to be cleaned up manually before a storage bucket can be deleted.
        // And session recordings can only be cleaned up once they are completed
        if (completedSessionRecording) {
          await apiClient.clients.SessionRecording.sessionRecordingServiceDeleteSessionRecording(
            {
              id: completedSessionRecording.id,
              body: { version: completedSessionRecording.version },
            },
          );
        }

        if (waitForSessionRecordingCount >= 20) {
          throw new Error(
            'Max attempts exceeded waiting for target to session recording to be completed',
          );
        }

        // avoid being rate limited
        await new Promise((r) => setTimeout(r, 500));
        waitForSessionRecordingCount++;
      }
    } finally {
      // End `boundary connect` process
      connect?.kill('SIGTERM');
    }

    apiClientTestAfter(async () => {
      const storageBuckets =
        (
          await apiClient.clients.StorageBucket.storageBucketServiceListStorageBuckets(
            {
              scopeId: 'global',
              recursive: true,
            },
          )
        ).items ?? [];

      expect(
        storageBuckets.find((bucket) => bucket.id === storageBuckets.id),
      ).toBeUndefined();
    });
  },
);
