import { v4 as randomId } from 'uuid';

const getBroadcastChannelName = (clientId, serviceName) =>
  `${clientId}-${serviceName}`;
let broadcastChannel = null;

const getClientId = async () => {
  const id = randomId();
  const clientId = await navigator.locks.request(
    id,
    { mode: 'exclusive' },
    async () => {
      const { held } = await navigator.locks.query();
      return held?.find((lock) => lock.name === id)?.clientId;
    },
  );

  navigator.locks.request(clientId, { mode: 'exclusive' }, async () => {
    await new Promise(() => {}); // Keep the lock until this context is destroyed
  });

  return clientId;
};

export default (serviceName, target, onProviderChange) => {
  const commonChannel = new BroadcastChannel(
    `shared-service-common-channel-${serviceName}`,
  );

  const requestsInFlight = new Map();

  const getOnRequestListener = (uuid, resolve, reject) => {
    const listener = (event) => {
      const { id, type } = event.data;
      if (id !== uuid || type === 'request') return;

      requestsInFlight.delete(uuid);
      broadcastChannel?.removeEventListener('message', listener);

      if (event.data.error) {
        console.error('Error processing request', event.data.error);
        return reject(event.data.error);
      }

      resolve(event.data.result);
    };

    return listener;
  };

  let readyResolve = null;
  const status = {
    ready: new Promise((resolve) => {
      readyResolve = resolve;
    }),
    isServiceProvider: new Promise((resolve) => {
      navigator.locks.query().then((locks) => {
        const isProvider = !locks.held?.find(
          (lock) => lock.name === serviceName,
        );
        resolve(isProvider);
        if (!isProvider) onNotProvider();
      });
    }),
  };

  navigator.locks.request(serviceName, { mode: 'exclusive' }, async () => {
    await onBecomeProvider();
    await new Promise(() => {}); // Keep the lock until this context is destroyed
  });

  const onNotProvider = async () => {
    const clientId = await getClientId();
    broadcastChannel = new BroadcastChannel(
      getBroadcastChannelName(clientId, serviceName),
    );

    const register = async () =>
      new Promise((resolve) => {
        const onRegisteredListener = (event) => {
          if (
            event.data.clientId === clientId &&
            event.data.type === 'registered'
          ) {
            commonChannel.removeEventListener('message', onRegisteredListener);
            resolve();
          }
        };
        commonChannel.addEventListener('message', onRegisteredListener);
        commonChannel.postMessage({ type: 'register', clientId });
      });

    commonChannel.addEventListener('message', async (event) => {
      if (
        event.data.type === 'providerChange' &&
        !(await status.isServiceProvider)
      ) {
        console.log(
          'Provider change detected. Re-registering with the new one...',
        );
        await onProviderChange?.(status.isServiceProvider);
        await register();

        if (requestsInFlight.size > 0) {
          console.log(
            'Requests were in flight when the provider changed. Requeuing...',
          );
          requestsInFlight.forEach(
            async ({ method, args, resolve, reject }, uuid) => {
              const onRequestlistener = getOnRequestListener(
                uuid,
                resolve,
                reject,
              );
              broadcastChannel?.addEventListener('message', onRequestlistener);
              broadcastChannel?.postMessage({
                id: uuid,
                type: 'request',
                method,
                args,
              });
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

    commonChannel.addEventListener('message', async (event) => {
      const { clientId, type } = event.data;
      if (type !== 'register') return;

      const clientChannel = new BroadcastChannel(
        getBroadcastChannelName(clientId, serviceName),
      );
      navigator.locks.request(clientId, { mode: 'exclusive' }, async () => {
        // The client has gone. Clean up
        clientChannel.close();
      });

      clientChannel.addEventListener('message', async (event) => {
        if (event.data.type === 'response') return;
        const { method, args, id } = event.data;

        let result, error;
        try {
          result = await target[method](...args);
        } catch (e) {
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

      commonChannel.postMessage({ type: 'registered', clientId, serviceName });
    });

    commonChannel.postMessage({ type: 'providerChange', serviceName });

    await onProviderChange?.(status.isServiceProvider);

    if (requestsInFlight.size > 0) {
      console.log(
        'Requests were in flight when this tab became the provider. Requeuing...',
      );
      requestsInFlight.forEach(
        async ({ method, args, resolve, reject }, uuid) => {
          try {
            const result = await target[method](...args);
            resolve(result);
          } catch (error) {
            console.error('Error processing request', error);
            reject(error);
          } finally {
            requestsInFlight.delete(uuid);
          }
        },
      );
    }

    readyResolve?.();
    readyResolve = null;
  };

  const proxy = new Proxy(target, {
    get: (target, method) => {
      if (method === 'then' || method === 'catch' || method === 'finally') {
        // Return undefined for these methods to allow promise chaining to work correctly
        return undefined;
      }

      return async (...args) => {
        if (await status.isServiceProvider)
          return await target[method](...args);

        return new Promise((resolve, reject) => {
          const uuid = randomId();
          const onRequestlistener = getOnRequestListener(uuid, resolve, reject);
          broadcastChannel?.addEventListener('message', onRequestlistener);

          broadcastChannel?.postMessage({
            id: uuid,
            type: 'request',
            method,
            args,
          });
          requestsInFlight.set(uuid, { method, args, resolve, reject });
        });
      };
    },
  });

  return { proxy, status };
};
