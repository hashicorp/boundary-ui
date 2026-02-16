/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import sinon from 'sinon';
import { typeOf } from '@ember/utils';
import { resourceNames } from 'api/handlers/cache-daemon-handler';
import { singularize } from 'ember-inflector';
import { underscore } from '@ember/string';

/**
 * This test helper can be used to help setup your sinon stubs in your tests.
 * Must be called after setupMirage.
 *
 * ```js
 * import setupStubs from 'api/test-support/handlers/cache-daemon-search';
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
 * help setup what the cache daemon search command returns.
 *
 * @module Test Helpers
 * @public
 */
export default function setupStubs(hooks) {
  let stubTypes = [];

  hooks.beforeEach(function () {
    const ipcService = this.owner.lookup('service:ipc');
    this.ipcStub = sinon.stub(ipcService, 'invoke');

    /**
     * We aim to still use mirage data when stubbing out the cache daemon
     * search. However, the handler expects the search data to be raw JSON from
     * the API which will get serialized. We add back the scope object for it to
     * get correctly normalized and other fields such as "attributes" from the
     * API will already be hoisted and will not be re-normalized from mirage data.
     *
     * This convenience method can take in multiple types,
     * e.g. this.stubCacheDaemonSearch('targets', 'sessions').
     * This will have sinon stub out each call so the first call to search will
     * provide all the models from the first parameter you specify,
     * the second call will provide all the models from the second argument, etc.
     * @param types
     */
    this.stubCacheDaemonSearch = (...types) => {
      stubTypes = types;

      types.forEach((type, i) => {
        this.ipcStub
          .withArgs('searchCacheDaemon')
          .onCall(i)
          .callsFake(() => {
            let models;
            let resourceName;
            if (typeOf(type) === 'object') {
              models = type.func();
              resourceName = type.resource;
            } else {
              models = this.server.schema[type].all().models;
              resourceName = type;
            }

            return {
              [underscore(resourceNames[singularize(resourceName)])]:
                models.map((model) => {
                  // Use internal serializer to serialize the model correctly
                  // according to our mirage serializers
                  const modelData =
                    this.server.serializerOrRegistry.serialize(model);

                  // Serialize the data properly to standard JSON as that is what
                  // we're expecting from the cache daemon response
                  return JSON.parse(JSON.stringify(modelData));
                }),
            };
          });
      });
    };
  });

  hooks.afterEach(function () {
    // Verify the number of mocks we set up match with how
    // many times the cache daemon was called with
    sinon.assert.callCount(
      this.ipcStub.withArgs('searchCacheDaemon'),
      stubTypes.length,
    );

    stubTypes.forEach((type, i) => {
      // Assert that the stub was called with the resource we're trying to mock
      // so we don't mistakenly mock the wrong resource
      const ipcCall = this.ipcStub.withArgs('searchCacheDaemon').getCall(i);
      let resource = type;
      if (typeOf(type) === 'object') {
        resource = type.resource;
      }

      const mappedResourceName = resourceNames[singularize(resource)];
      sinon.assert.match(ipcCall.args[1], { resource: mappedResourceName });
    });

    sinon.restore();
  });
}
