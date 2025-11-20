import { settled } from '@ember/test-helpers';
import startMirage from 'api/mirage/config';

export function setupMirage(hooks) {
  hooks.beforeEach(function () {
    if (!this.owner) {
      throw new Error(
        'Must call one of the ember-qunit setupTest() / setupRenderingTest() / setupApplicationTest() first',
      );
    }

    // the environment property here is configuration to the mirage server:
    // https://github.com/miragejs/miragejs/blob/7ff4f3f6fe56bf0cb1648f5af3f5210fcb07e20b/types/index.d.ts#L383
    // It is not related to ember's build environment. In this case for mirage the "test" environment does
    // not load the default scenario:
    // https://github.com/miragejs/miragejs/blob/7ff4f3f6fe56bf0cb1648f5af3f5210fcb07e20b/lib/server.js#L302
    this.server = startMirage({ environment: 'test' });
  });

  hooks.afterEach(function () {
    return settled().then(() => {
      if (this.server) {
        this.server.shutdown();
        delete this.server;
      }
    });
  });
}
