import can from 'admin/helpers/can';
import Dropdown from '@hashicorp/design-system-components/components/hds/dropdown/index';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
<template>
  {{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

  {{#if (can 'delete model' @model)}}
    <Dropdown data-test-manage-hosts-dropdown as |dd|>
      <dd.ToggleButton @text={{t 'actions.manage'}} @color='secondary' />
      <dd.Interactive @color='critical' {{on 'click' (fn @delete @model)}}>{{t
          'resources.host.actions.delete'
        }}</dd.Interactive>
    </Dropdown>
  {{/if}}
</template>
