/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { v4 as uuidv4 } from 'uuid';

let clientChannel = null;
let commonChannel = null;
const requestsInFlight = new Map();

export default (serviceName, target, onProviderChange) => {
  commonChannel = new BroadcastChannel(
    `shared-service-common-channel-${serviceName}`,
  );

  let { promise: ready, resolve: readyResolve } = Promise.withResolvers();
  const status = {
    ready,
    isServiceProvider: false,
  };

  const proxy = getProxy(target, status);

  // This lock is used to ensure that only one tab can become the provider with an indefinite lock.
  navigator.locks.request(serviceName, { mode: 'exclusive' }, async () => {
    // If a client was promoted to provider, reset the ready status and resolver
    if (readyResolve === null) {
      const { promise: newReady, resolve: newResolve } =
        Promise.withResolvers();
      status.ready = newReady;
      readyResolve = newResolve;
    }

    status.isServiceProvider = true;
    await onBecomeProvider({
      serviceName,
      onProviderChange,
      target,
      status,
    });
    readyResolve();
    readyResolve = null;
    await new Promise(() => {});
  });

  (async () => {
    let providerExists = false;

    // Make sure a lock was acquired which means we have a provider
    while (!providerExists) {
      const locks = await navigator.locks.query();
      providerExists = locks.held?.some((lock) => lock.name === serviceName);
    }

    if (!status.isServiceProvider) {
      await onNotProvider({
        serviceName,
        onProviderChange,
        status,
      });
      readyResolve();
      readyResolve = null;
    }
  })();

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

// When we become a client instead of a provider we do two things:
// 1. Register ourselves with the provider and wait for a response that says we registered.
// 2. Setup an event listener to know when a provider has changed.
const onNotProvider = async ({ serviceName, onProviderChange, status }) => {
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
    if (data.type === 'providerChange' && !status.isServiceProvider) {
      await onProviderChange?.(status.isServiceProvider);
      await register();

      // If there were requests in flight when the provider was changed,
      // we need to resend them to the new provider.
      if (requestsInFlight.size > 0) {
        requestsInFlight.forEach(({ method, args, resolve, reject }, uuid) => {
          requestFromProvider(uuid, resolve, reject, method, args);
        });
      }
    }
  });

  await register();
};

// When we become the provider, we do two things:
// 1. Set an event listener to check for clients trying to register with us. As part of registration,
//    we also setup a listener with the individual client to listen for requests.
// 2. Send a message to all tabs that we've now become the provider
const onBecomeProvider = async ({
  serviceName,
  onProviderChange,
  target,
  status,
}) => {
  // Set an event listener for other tabs to register with the provider tab
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

  await onProviderChange?.(status.isServiceProvider);
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
};

// Returns a proxy that we will have all caller methods go through.
// If we're the provider, we just call the method directly. If we're not the provider, we'll
// send the request through our established client channel to have the provider respond with the data.
const getProxy = (target, status) =>
  new Proxy(target, {
    get: (target, method) => {
      if (method === 'then' || method === 'catch' || method === 'finally') {
        // Return undefined for these methods to allow promise chaining to work correctly
        return;
      }

      return async (...args) => {
        if (status.isServiceProvider) {
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
