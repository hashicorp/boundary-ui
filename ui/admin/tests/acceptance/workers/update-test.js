/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | workers | update', function (hooks) {
  setupApplicationTest(hooks);

  const instances = {
    scopes: {
      global: null,
    },
  };

  const urls = {
    globalScope: null,
    workers: null,
    worker: null,
  };

  hooks.beforeEach(async function () {
    //Generate the resources
    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });
    // Generate route URLs for resources
    urls.globalScope = '/scopes/global';
    urls.workers = `${urls.globalScope}/workers`;
    urls.worker = `${urls.workers}/${instances.worker.id}`;
  });

  test('can save changes to an existing worker', async function (assert) {
    await visit(urls.worker);

    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.HREF(urls.worker)).isVisible();
    await assert
      .dom(commonSelectors.FIELD_NAME)
      .hasValue(commonSelectors.FIELD_NAME_VALUE);
  });

  test('can cancel changes to an existing worker', async function (assert) {
    const name = instances.worker.name;
    await visit(urls.worker);

    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    await assert.dom(commonSelectors.FIELD_NAME).hasValue(`${name}`);
  });

  test('saving an existing worker with invalid fields displays error messages', async function (assert) {
    const errorMessage = 'Error in provided request.';
    const errorDescription = 'Must be all lowercase.';
    this.server.patch('/workers/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMessage,
          details: {
            request_fields: [
              {
                name: 'name',
                description: errorDescription,
              },
            ],
          },
        },
      );
    });
    await visit(urls.worker);

    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
    assert.dom(commonSelectors.FIELD_NAME_ERROR).hasText(errorDescription);
  });
});
