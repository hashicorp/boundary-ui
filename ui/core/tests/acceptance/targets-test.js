import { module, test } from 'qunit';
//import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
//import a11yAudit from 'ember-a11y-testing/test-support/audit';
// import {
//   authenticateSession,
//   // These are left here intentionally for future reference.
//   //currentSession,
//   //invalidateSession,
// } from 'ember-simple-auth/test-support';

module('Acceptance | targets', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    // Generate route URLs for resources
  });

  test('visiting targets', async function (assert) {
    assert.expect(0);
  });

  test('can navigate to a target form', async function (assert) {
    assert.expect(0);
  });

  test('can update a target and save changes', async function (assert) {
    assert.expect(0);
  });

  test('can update a target and cancel changes', async function (assert) {
    assert.expect(0);
  });

  test('can create new target', async function (assert) {
    assert.expect(0);
  });

  test('can cancel new target creation', async function (assert) {
    assert.expect(0);
  });

  test('saving a new target with invalid fields displays error messages', async function (assert) {
    assert.expect(0);
  });

  test('errors are displayed when save on target fails', async function (assert) {
    assert.expect(0);
  });

  test('errors are displayed when delete on a target fails', async function (assert) {
    assert.expect(0);
  });

  test('saving an existing target with invalid fields displays error messages', async function (assert) {
    assert.expect(0);
  });

  test('viewing target host sets', async function (assert) {
    assert.expect(0);
  });

  test('can delete a host sets', async function(assert) {
    assert.expect(0);
  });
});
