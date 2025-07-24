/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { v4 as uuidv4 } from 'uuid';

let clientChannel = null;
const requestsInFlight = new Map();

export default (serviceName, target, onProviderChange) => {
  const commonChannel = new BroadcastChannel(
    `shared-service-common-channel-${serviceName}`,
  );

  let readyResolve = null;
  const status = {
    // Set a promise that doesn't resolve until our setup is finished
    ready: new Promise((resolve) => {
      readyResolve = resolve;
    }),
    // Check if there's an existing provider
    isServiceProvider: (async () => {
      const locks = await navigator.locks.query();
      const isProvider = !locks.held?.find((lock) => lock.name === serviceName);
      if (!isProvider) {
        await onNotProvider();
      }
      return isProvider;
    })(),
  };

  // This lock is used to ensure that only one tab can become the provider with an indefinite lock.
  navigator.locks.request(serviceName, { mode: 'exclusive' }, async () => {
    await onBecomeProvider();
    await new Promise(() => {});
  });

  const onNotProvider = async () => {
    const clientId = getClientId();
    clientChannel = new BroadcastChannel(
      getClientBroadcastChannelName(clientId, serviceName),
    );

    const register = async () =>
      new Promise((resolve) => {
        const onRegisteredListener = ({ data }) => {
          if (data.clientId === clientId && data.type === 'registered') {
            commonChannel.removeEventListener('message', onRegisteredListener);
            resolve();
          }
        };

        // Add an event listener to check for the registration response
        commonChannel.addEventListener('message', onRegisteredListener);
        commonChannel.postMessage({ type: 'register', clientId });
      });

    commonChannel.addEventListener('message', async ({ data }) => {
      // Check if this was a provider change. If so and we're not the new provider, re-register.
      if (data.type === 'providerChange' && !(await status.isServiceProvider)) {
        await onProviderChange?.(await status.isServiceProvider);
        await register();

        // If there were requests in flight when the provider was changed,
        // we need to resend them to the new provider.
        if (requestsInFlight.size > 0) {
          requestsInFlight.forEach(
            ({ method, args, resolve, reject }, uuid) => {
              requestFromProvider(uuid, resolve, reject, method, args);
            },
          );
        }
      }
    });

    await register();

    readyResolve?.();
    readyResolve = null;
  };

  const onBecomeProvider = async () => {
    status.isServiceProvider = Promise.resolve(true);

    if (readyResolve === null) {
      status.ready = new Promise((resolve) => {
        readyResolve = resolve;
      });
    }

    // Set an event listener for other tabs to use to register with the provider tab
    commonChannel.addEventListener('message', async (event) => {
      const { clientId, type } = event.data;
      if (type !== 'register') {
        return;
      }

      const clientChannel = new BroadcastChannel(
        getClientBroadcastChannelName(clientId, serviceName),
      );

      // Acquire another lock that immediately is waiting for the
      // initial lock on the client tab to be resolved to handle cleanup.
      navigator.locks.request(clientId, { mode: 'exclusive' }, async () => {
        // The client tab was closed, clean up.
        clientChannel.close();
      });

      // Setup an event listener for communication between the provider and subscriber to respond to requests
      clientChannel.addEventListener('message', async ({ data }) => {
        if (data.type === 'response') {
          return;
        }
        const { method, args, id } = data;

        let result, error;
        try {
          result = await target[method](...args);
        } catch (e) {
          // Error objects won't be properly serialized, we need to reconstruct an error like object
          error =
            e instanceof Error
              ? Object.fromEntries(
                  Object.getOwnPropertyNames(e).map((k) => [k, e[k]]),
                )
              : e;
        }

        clientChannel.postMessage({
          id,
          type: 'response',
          result,
          error,
          method,
        });
      });

      // Send back a message to the client that we finished registering
      commonChannel.postMessage({ type: 'registered', clientId, serviceName });
    });

    await onProviderChange?.(await status.isServiceProvider);

    commonChannel.postMessage({ type: 'providerChange', serviceName });

    // If we became the new provider and there were requests in flight, request it directly again.
    if (requestsInFlight.size > 0) {
      await Promise.all(
        Array.from(
          requestsInFlight,
          async ([uuid, { method, args, resolve, reject }]) => {
            try {
              const result = await target[method](...args);
              resolve(result);
            } catch (error) {
              reject(error);
            } finally {
              requestsInFlight.delete(uuid);
            }
          },
        ),
      );
    }

    readyResolve?.();
    readyResolve = null;
  };

  const proxy = new Proxy(target, {
    get: (target, method) => {
      if (method === 'then' || method === 'catch' || method === 'finally') {
        // Return undefined for these methods to allow promise chaining to work correctly
        return;
      }

      return async (...args) => {
        if (await status.isServiceProvider) {
          return await target[method](...args);
        }

        return new Promise((resolve, reject) => {
          const uuid = uuidv4();
          requestFromProvider(uuid, resolve, reject, method, args);
          requestsInFlight.set(uuid, { method, args, resolve, reject });
        });
      };
    },
  });

  return { proxy, status };
};

const getClientBroadcastChannelName = (clientId, serviceName) =>
  `${clientId}-${serviceName}`;

// Generate a random ID for the tab to use as a lock name to hold indefinitely until the tab is closed
const getClientId = () => {
  const clientId = uuidv4();

  // Keep the lock until this context is destroyed (which means the tab was closed).
  navigator.locks.request(clientId, { mode: 'exclusive' }, async () => {
    await new Promise(() => {});
  });

  return clientId;
};

// Sends a message to the provider to call the method on behalf of a client.
const requestFromProvider = (uuid, resolve, reject, method, args) => {
  const onRequestListener = getOnRequestListener(uuid, resolve, reject);

  // Listen for a response to know we finished and remove from the list of requests in flight
  clientChannel?.addEventListener('message', onRequestListener);
  clientChannel?.postMessage({
    id: uuid,
    type: 'request',
    method,
    args,
  });
};

// Return the listener used for responding to requests. Only listens for response messages.
const getOnRequestListener = (uuid, resolve, reject) => {
  const listener = ({ data }) => {
    const { id, type } = data;
    if (id !== uuid || type === 'request') {
      return;
    }

    requestsInFlight.delete(uuid);
    clientChannel?.removeEventListener('message', listener);

    if (data.error) {
      reject(data.error);
    }

    resolve(data.result);
  };

  return listener;
};
