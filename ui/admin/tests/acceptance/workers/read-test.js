import { visit, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | workers | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let orgScope;
  let workersURL;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    worker: null,
  };

  hooks.beforeEach(function () {
    orgScope = this.server.create(
      'scope',
      {
        type: 'org',
      },
      'withChildren'
    );

    instances.worker = this.server.create('worker', {
      scope: orgScope,
    });
    workersURL = `/scopes/${orgScope.id}/workers`;
    authenticateSession({});
  });

  test('visiting workers', async function (assert) {
    assert.expect(1);
    await visit(workersURL);
    await a11yAudit();
    assert.strictEqual(currentURL(), workersURL);
  });

  test('cannot navigate to an worker form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter((item) => item !== 'read');
    await visit(workersURL);
    assert.notOk(find('main tbody .rose-table-header-cell:nth-child(1) a'));
  });
});
