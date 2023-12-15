import sinon from 'sinon';

/**
 * This test helper can be used to help setup your sinon stubs in your tests.
 * Must be called after setupMirage.
 *
 * ```js
 * import setupStubs from 'api/test-support/handlers/client-daemon-search';
 *
 * module('Acceptance | my test', function(hooks) {
 *  setupApplicationTest(hooks);
 *  setupMirage(hooks);
 *  setupStubs(hooks);
 *
 *   // add your actual tests here
 * });
 * ```
 *
 * This will setup a stub for the IPC service and include helper methods to
 * help setup what the client daemon search command returns.
 *
 * @module Test Helpers
 * @public
 */
export default function setupStubs(hooks) {
  hooks.beforeEach(function () {
    const ipcService = this.owner.lookup('service:ipc');
    this.ipcStub = sinon.stub(ipcService, 'invoke');

    /**
     * We aim to still use mirage data when stubbing out the client daemon
     * search. However, the handler expects the search data to be raw JSON from
     * the API which will get serialized. We add back the scope object for it to
     * get correctly normalized and other fields such as "attributes" from the
     * API will already be hoisted and will not be re-normalized from mirage data.
     *
     * This convenience method can take in multiple types,
     * e.g. this.stubClientDaemonSearch('targets', 'sessions').
     * This will have sinon stub out each call so the first call to search will
     * provide all the models from the first parameter you specify,
     * the second call will provide all the models from the second argument, etc.
     * @param types
     */
    this.stubClientDaemonSearch = (...types) => {
      types.forEach((type, i) => {
        this.ipcStub
          .withArgs('searchClientDaemon')
          .onCall(i)
          .returns({
            [type]: this.server.schema[type]?.all().models.map((model) => {
              // Use internal serializer to serialize the model correctly
              // according to our mirage serializers
              const modelData =
                this.server.serializerOrRegistry.serialize(model);

              // Serialize the data properly to standard JSON as that is what
              // we're expecting from the client daemon response
              return JSON.parse(JSON.stringify(modelData));
            }),
          });
      });
    };
  });

  hooks.afterEach(function () {
    sinon.restore();
  });
}
