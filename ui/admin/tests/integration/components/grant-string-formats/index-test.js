/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | grant-string-formats/index',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    const STRING_FORMATS_SELECT = '[name="string-formats"]';
    const RESOURCE_TYPE_OPTION = '[data-option-index="0"]';
    const RESOURCE_OPTION = '[data-option-index="1"]';
    const PINNED_ID_OPTION = '[data-option-index="2"]';
    const OUTPUT_FIELDS_OPTION = '[data-option-index="3"]';
    const ACCOUNT_TEMPLATE_OPTION = '[data-option-index="4"]';
    const USER_TEMPLATE_OPTION = '[data-option-index="5"]';
    const STRING_FORMAT_FIELD = '[name="string-format"]';
    const MORE_INFO_LINK = '.hds-link-standalone';

    const options = {
      resourceType: RESOURCE_TYPE_OPTION,
      resource: RESOURCE_OPTION,
      pinnedId: PINNED_ID_OPTION,
      outputFields: OUTPUT_FIELDS_OPTION,
      accountTemplate: ACCOUNT_TEMPLATE_OPTION,
      userTemplate: USER_TEMPLATE_OPTION,
    };

    test.each(
      'it renders the expected string format for each option',
      [
        {
          selectedOption: 'resourceType',
          expectedValue:
            'type=<insert resource types>;actions=<insert actions>',
        },
        {
          optionToClick: RESOURCE_OPTION,
          selectedOption: 'resource',
          expectedValue: 'ids=<insert resource ids>;actions=<insert actions>',
        },
        {
          optionToClick: PINNED_ID_OPTION,
          selectedOption: 'pinnedId',
          expectedValue:
            'ids=<insert id>;type=<insert resource types>;actions=<insert actions>',
        },
        {
          optionToClick: OUTPUT_FIELDS_OPTION,
          selectedOption: 'outputFields',
          expectedValue: 'output_fields=<insert output fields>',
        },
        {
          optionToClick: ACCOUNT_TEMPLATE_OPTION,
          selectedOption: 'accountTemplate',
          expectedValue: 'ids={{.Account.Id}}',
        },
        {
          optionToClick: USER_TEMPLATE_OPTION,
          selectedOption: 'userTemplate',
          expectedValue: 'ids={{.User.Id}}',
        },
      ],
      async function (
        assert,
        { optionToClick, selectedOption, expectedValue },
      ) {
        await render(hbs`<GrantStringFormats />`);

        await click(STRING_FORMATS_SELECT);

        if (optionToClick) {
          await click(optionToClick);
          await click(STRING_FORMATS_SELECT);
        }

        for (const [optionName, selector] of Object.entries(options)) {
          assert
            .dom(selector)
            .hasAria(
              'selected',
              optionName === selectedOption ? 'true' : 'false',
            );
        }

        assert.dom(STRING_FORMAT_FIELD).hasValue(expectedValue);
        assert.dom(MORE_INFO_LINK).isVisible();
      },
    );
  },
);
