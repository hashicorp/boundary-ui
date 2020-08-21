import { module, test } from 'qunit';
// import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
// import a11yAudit from 'ember-a11y-testing/test-support/audit';
// import {
//   authenticateSession,
//   // These are left here intentionally for future reference.
//   //currentSession,
//   //invalidateSession,
// } from 'ember-simple-auth/test-support';

module('Acceptance | hosts', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    // Generate route URLs for resources
  });

  test('visiting host', async function (assert) {
    assert.expect(0);
  });

  test('can navigate to a host form', async function (assert) {
    assert.expect(0);
  });

  test('can update a host and save changes', async function (assert) {
    assert.expect(0);
  });

  test('can update a host and cancel changes', async function (assert) {
    assert.expect(0);
  });

  test('can create new host', async function (assert) {
    assert.expect(0);
  });

  test('can cancel new host creation', async function (assert) {
    assert.expect(0);
  });

  test('saving a new host with invalid fields displays error messages', async function (assert) {
    assert.expect(0);
  });

  test('errors are displayed when save on auth method fails', async function (assert) {
    assert.expect(0);
  });

  test('errors are displayed when delete on a host fails', async function (assert) {
    assert.expect(0);
  });

  test('saving an existing host with invalid fields displays error messages', async function (assert) {
    assert.expect(0);
  });
});
