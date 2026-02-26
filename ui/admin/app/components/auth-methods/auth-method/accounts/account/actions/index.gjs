import can from 'admin/helpers/can';
import Dropdown from '@hashicorp/design-system-components/components/hds/dropdown/index';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
<template>
  {{#if (can 'delete account' @model)}}
    <Dropdown data-test-manage-account-auth-method as |dd|>
      <dd.ToggleButton @text={{t 'actions.manage'}} @color='secondary' />
      <dd.Interactive @color='critical' {{on 'click' (fn @delete @model)}}>{{t
          'resources.account.actions.delete'
        }}</dd.Interactive>
    </Dropdown>
  {{/if}}
</template>
