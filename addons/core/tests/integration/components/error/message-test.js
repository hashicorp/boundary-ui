/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | error/message', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  const ERROR_MSG_TITLE =
    '[data-test-error-application-state] .hds-application-state__title';
  const ERROR_MSG_CODE =
    '[data-test-error-application-state] .hds-application-state__error-code';
  const ERROR_MSG_BODY =
    '[data-test-error-application-state] .hds-application-state__body-text';
  const ERROR_MSG_LINK =
    '[data-test-error-application-state] .hds-link-standalone';
  const ERROR_MSG_LINK_TEXT =
    '[data-test-error-application-state] .hds-link-standalone__text';

  test('it renders predefined message for known error status', async function (assert) {
    await render(hbs`<Error::Message @status='401' />`);

    assert.dom(ERROR_MSG_TITLE).hasText('You are not signed in');
    assert.dom(ERROR_MSG_CODE).hasText('ERROR 401');
    assert
      .dom(ERROR_MSG_BODY)
      .hasText('You are not signed in. Please sign in and try again later.');

    await render(hbs`<Error::Message @status='403' />`);

    assert.dom(ERROR_MSG_TITLE).hasText('You are not authorized');
    assert.dom(ERROR_MSG_CODE).hasText('ERROR 403');
    assert
      .dom(ERROR_MSG_BODY)
      .hasText(
        'You must be granted permissions to view this data. Ask your administrator if you think you should have access.',
      );

    await render(hbs`<Error::Message @status='404' />`);

    assert.dom(ERROR_MSG_TITLE).hasText('Resource not found');
    assert.dom(ERROR_MSG_CODE).hasText('ERROR 404');
    assert
      .dom(ERROR_MSG_BODY)
      .hasText(
        'We could not find the requested resource. You can ask your administrator or try again later.',
      );
  });

  test('it renders default error for unknown error status', async function (assert) {
    await render(hbs`<Error::Message @status='599' />`);

    assert.dom(ERROR_MSG_TITLE).hasText('Something went wrong');
    assert.dom(ERROR_MSG_CODE).hasText('ERROR 599');
    assert
      .dom(ERROR_MSG_BODY)
      .hasText(
        "We're not sure what happened.  Please contact your administrator or try again later.",
      );
  });

  test('it renders help link with provided doc url', async function (assert) {
    await render(
      hbs`<Error::Message @status='599' @docLink='https://support' />`,
    );

    assert.dom(ERROR_MSG_LINK_TEXT).hasText('Need help');
    assert.dom(ERROR_MSG_LINK).hasAttribute('href', 'https://support');
  });
});
