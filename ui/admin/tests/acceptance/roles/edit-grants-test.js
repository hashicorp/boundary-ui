/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  click,
  currentURL,
  find,
  select,
  waitFor,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | roles/edit grants', function (hooks) {
  setupApplicationTest(hooks);

  const instances = {
    scopes: {
      global: null,
    },
    role: null,
  };

  const urls = {
    role: null,
    editGrants: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.role = this.server.create('role', {
      scope: instances.scopes.global,
      grant_strings: [
        'ids=*;type=role;actions=read',
        'ids=ttcp_1234567890;type=target;actions=authorize-session',
      ],
    });
    urls.role = `/scopes/global/roles/${instances.role.id}`;
    urls.editGrants = `${urls.role}/edit-grants`;
  });

  test('can navigate to edit grants for roles with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-02-27
          enabled: false,
        },
      },
    });

    await visit(urls.role);

    assert.true(instances.role.authorized_actions.includes('set-grants'));

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_EDIT_GRANTS);

    assert.strictEqual(currentURL(), urls.editGrants);
  });

  test('cannot navigate to edit grants for roles without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-02-27
          enabled: false,
        },
      },
    });

    instances.role.authorized_actions =
      instances.role.authorized_actions.filter(
        (action) => action !== 'set-grants',
      );
    await visit(urls.role);

    assert.false(instances.role.authorized_actions.includes('set-grants'));

    await click(selectors.MANAGE_DROPDOWN_ROLES);

    assert.dom(selectors.MANAGE_DROPDOWN_EDIT_GRANTS).doesNotExist();
    assert.strictEqual(currentURL(), urls.role);
  });

  test('user can export a terraform formatted grant string', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-03-17
          enabled: false,
        },
      },
    });

    await visit(urls.role);

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_EDIT_GRANTS);
    await click(selectors.EXPORT_GRANTS_BTN);

    assert.dom(selectors.EXPORT_OPTIONS_FLYOUT).isVisible();
    assert.dom(selectors.EXPORT_FORMAT_SELECT).hasValue('terraform');
    // TODO: Update to check for the actual formatted grant string.
    assert
      .dom(selectors.FORMATTED_EXPORT_CODE_BLOCK)
      .includesText('grant_strings');
  });

  test('user can export a hcl formatted grant string', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-03-17
          enabled: false,
        },
      },
    });

    await visit(urls.role);

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_EDIT_GRANTS);
    await click(selectors.EXPORT_GRANTS_BTN);
    await select(selectors.EXPORT_FORMAT_SELECT, 'native-hcl');

    assert.dom(selectors.EXPORT_OPTIONS_FLYOUT).isVisible();
    assert.dom(selectors.EXPORT_FORMAT_SELECT).hasValue('native-hcl');
    // TODO: Update to check for the actual formatted grant string.
  });

  test('loads current grants in the editor and updates them', async function (assert) {
    assert.expect(4);
    const newGrantString = 'ids=*;type=session;actions=list,read';
    const expectedGrantStrings = [
      ...instances.role.grant_strings,
      newGrantString,
    ];

    await visit(urls.editGrants);
    await waitFor(commonSelectors.CODE_EDITOR_CM);

    assert
      .dom(commonSelectors.CODE_EDITOR_CONTENT)
      .includesText(instances.role.grant_strings[0]);
    assert
      .dom(commonSelectors.CODE_EDITOR_CONTENT)
      .includesText(instances.role.grant_strings[1]);

    const editorElement = find(commonSelectors.CODE_EDITOR_CODE);
    const editorView = editorElement.editor;
    editorView.dispatch({
      changes: {
        from: editorView.state.doc.length,
        insert: `\n${newGrantString}`,
      },
    });

    assert
      .dom(commonSelectors.CODE_EDITOR_CONTENT)
      .includesText(newGrantString);

    await click(commonSelectors.SAVE_BTN);

    assert.deepEqual(
      this.server.schema.roles.find(instances.role.id).attrs.grantStrings,
      expectedGrantStrings,
    );
  });
});
