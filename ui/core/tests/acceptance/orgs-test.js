import { module, test } from 'qunit';
//import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
//import a11yAudit from 'ember-a11y-testing/test-support/audit';
//import { Response } from 'miragejs';
import //authenticateSession,
// These are left here intentionally for future reference.
//currentSession,
//invalidateSession,
'ember-simple-auth/test-support';

module('Acceptance | org', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  // let org;
  // let orgID;
  // let orgsURL;
  // let newOrgURL;
  // let existingOrg;
  // let existingOrgURL;
  // let getOrgScopesCount;
  // let getFirstOrgScope;
  // let initialOrgScopesCount;
  //
  // hooks.beforeEach(function () {
  //   authenticateSession({});
  //
  // });

  test('visiting orgs', async function (assert) {
    assert.expect(0);
  });

  test('visiting orgs within a org scope redirects to the parent org scope', async function (assert) {
    assert.expect(0);
  });

  test('can create new orgs', async function (assert) {
    assert.expect(0);
  });

  test('can cancel create new orgs', async function (assert) {
    assert.expect(0);
  });

  test('saving a new org with invalid fields displays error messages', async function (assert) {
    assert.expect(0);
  });

  test('can save changes to existing org', async function (assert) {
    assert.expect(0);
  });

  test('can cancel changes to existing org', async function (assert) {
    assert.expect(0);
  });

  test('can delete org', async function (assert) {
    assert.expect(0);
  });

  test('saving an existing org with invalid fields displays error messages', async function (assert) {
    assert.expect(0);
  });

  test('errors are displayed when save org fails', async function (assert) {
    assert.expect(0);
  });

  test('errors are displayed when delete org fails', async function (assert) {
    assert.expect(0);
  });
});
