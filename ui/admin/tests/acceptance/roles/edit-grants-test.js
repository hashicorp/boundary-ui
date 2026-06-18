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
  triggerKeyEvent,
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
    assert.dom(selectors.FORMATTED_EXPORT_CODE_BLOCK).hasText(`
      grant_strings = [
        "${instances.role.grant_strings[0]}",
        "${instances.role.grant_strings[1]}",
      ]
    `);
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
    assert.dom(selectors.FORMATTED_EXPORT_CODE_BLOCK).hasText(`
      [
        "${instances.role.grant_strings[0]}",
        "${instances.role.grant_strings[1]}",
      ]
    `);
  });

  test('loads current grants in the editor and updates them', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-05-15
          enabled: false,
        },
      },
    });

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

  test('shows actions for the first grant on page load', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-05-15
          enabled: false,
        },
      },
    });

    await visit(urls.editGrants);

    assert.dom(selectors.GRANT_ACTIONS_NO_TYPE_DETECTED).doesNotExist();
    // opted to not check for specific actions here since the grants schema
    // may change and cause the test to fail even though the functionality
    // is working as expected
    assert.dom(selectors.GRANT_ACTIONS_TABLE).isVisible();
  });

  test('shows "no type detected" in actions sidebar when role has no grants', async function (assert) {
    const emptyRole = this.server.create('role', {
      scope: instances.scopes.global,
      grant_strings: [],
    });
    const editGrantsUrl = `/scopes/global/roles/${emptyRole.id}/edit-grants`;

    await visit(editGrantsUrl);

    assert.dom(selectors.GRANT_ACTIONS_NO_TYPE_DETECTED).isVisible();
    assert.dom(selectors.GRANT_ACTIONS_TABLE).doesNotExist();
  });

  test('actions sidebar updates to "no type detected" when cursor moves to an empty line', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-05-15
          enabled: false,
        },
      },
    });

    const role = this.server.create('role', {
      scope: instances.scopes.global,
      grant_strings: ['ids=*;type=role;actions=read', ''],
    });
    const editGrantsUrl = `/scopes/global/roles/${role.id}/edit-grants`;

    await visit(editGrantsUrl);
    await waitFor(commonSelectors.CODE_EDITOR_CM);

    // Line 1 is a valid grant — the actions table should be visible
    assert.dom(selectors.GRANT_ACTIONS_TABLE).isVisible();

    const editorElement = find(commonSelectors.CODE_EDITOR_CODE);
    const editorView = editorElement.editor;

    // Move cursor to the second (empty) line
    const line2 = editorView.state.doc.line(2);
    editorView.dispatch({ selection: { anchor: line2.from } });

    await waitFor(selectors.GRANT_ACTIONS_NO_TYPE_DETECTED);

    assert.dom(selectors.GRANT_ACTIONS_NO_TYPE_DETECTED).isVisible();
    assert.dom(selectors.GRANT_ACTIONS_TABLE).doesNotExist();
  });

  test('actions sidebar shows "invalid id or type" for a grant with an unrecognised type', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-05-15
          enabled: false,
        },
      },
    });

    const role = this.server.create('role', {
      scope: instances.scopes.global,
      grant_strings: ['type=not-a-valid-type;actions=read'],
    });
    const editGrantsUrl = `/scopes/global/roles/${role.id}/edit-grants`;

    await visit(editGrantsUrl);
    await waitFor(commonSelectors.CODE_EDITOR_CM);

    assert.dom(selectors.GRANT_ACTIONS_INVALID_ID_OR_TYPE).isVisible();
    assert.dom(selectors.GRANT_ACTIONS_TABLE).doesNotExist();
  });

  test('shows linting error markers for an invalid grant string', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-05-15
          enabled: false,
        },
      },
    });

    await visit(urls.editGrants);
    await waitFor(commonSelectors.CODE_EDITOR_CM);

    const editorElement = find(commonSelectors.CODE_EDITOR_CODE);
    const editorView = editorElement.editor;

    // Replace the editor content with an invalid grant string:
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: 'ids=*',
      },
    });

    await waitFor(selectors.LINT_ERROR_MARKER);

    assert.dom(selectors.LINT_ERROR_MARKER).exists();
  });

  test('shows autocomplete suggestions when triggered', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-05-15
          enabled: false,
        },
      },
    });

    await visit(urls.editGrants);
    await waitFor(commonSelectors.CODE_EDITOR_CM);

    const editorElement = find(commonSelectors.CODE_EDITOR_CODE);
    const editorView = editorElement.editor;

    // Insert a partial grant string ending with 'type=' so completions are expected
    editorView.dispatch({
      changes: {
        from: editorView.state.doc.length,
        insert: '\ntype=',
      },
      selection: { anchor: editorView.state.doc.length + '\ntype='.length },
    });

    // Trigger Ctrl+Space
    await triggerKeyEvent(
      find(commonSelectors.CODE_EDITOR_CONTENT),
      'keydown',
      ' ',
      { ctrlKey: true },
    );

    await waitFor(selectors.AUTOCOMPLETE_TOOLTIP);

    assert.dom(selectors.AUTOCOMPLETE_TOOLTIP).isVisible();
  });

  test('can discard unsaved grant changes via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-06-17
          enabled: false,
        },
      },
    });

    assert.expect(3);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    await visit(urls.editGrants);
    await waitFor(commonSelectors.CODE_EDITOR_CM);

    const newGrantString = 'ids=*;type=session;actions=list';
    const editorElement = find(commonSelectors.CODE_EDITOR_CODE);
    const editorView = editorElement.editor;
    editorView.dispatch({
      changes: {
        from: editorView.state.doc.length,
        insert: `\n${newGrantString}`,
      },
    });
    await click(commonSelectors.HREF(urls.role));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(currentURL(), urls.role);
    console.log(this.server.schema.roles.find(instances.role.id));
    assert.false(
      this.server.schema.roles
        .find(instances.role.id)
        .grant_strings.includes(newGrantString),
    );
  });

  test('can cancel discard grant changes via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-06-17
          enabled: false,
        },
      },
    });

    assert.expect(3);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;

    await visit(urls.editGrants);
    await waitFor(commonSelectors.CODE_EDITOR_CM);

    const newGrantString = 'ids=*;type=session;actions=list';
    const editorElement = find(commonSelectors.CODE_EDITOR_CODE);
    const editorView = editorElement.editor;
    editorView.dispatch({
      changes: {
        from: editorView.state.doc.length,
        insert: `\n${newGrantString}`,
      },
    });
    await click(commonSelectors.HREF(urls.role));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.editGrants);
    assert
      .dom(commonSelectors.CODE_EDITOR_CONTENT)
      .includesText(newGrantString);
  });
});
