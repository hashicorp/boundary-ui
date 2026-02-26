import { hash, fn } from '@ember/helper';
import can from 'admin/helpers/can';
import or from 'ember-truth-helpers/helpers/or';
import Dropdown from '@hashicorp/design-system-components/components/hds/dropdown/index';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
<template>
  {{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

  {{#let
    (hash
      canAddHosts=(can 'addHosts hostSet' @model)
      canDelete=(can 'delete model' @model)
    )
    as |perms|
  }}
    {{#if (or perms.canAddHosts perms.canDelete)}}
      <Dropdown data-test-manage-dropdown-host-sets as |dd|>
        <dd.ToggleButton @text={{t 'actions.manage'}} @color='secondary' />
        {{#if perms.canAddHosts}}
          <dd.Interactive
            @route='scopes.scope.host-catalogs.host-catalog.host-sets.host-set.create-and-add-host'
          >
            {{t 'resources.host-set.actions.create-and-add-host'}}
          </dd.Interactive>
          <dd.Interactive
            @route='scopes.scope.host-catalogs.host-catalog.host-sets.host-set.add-hosts'
          >
            {{t 'resources.host-set.actions.add-hosts'}}
          </dd.Interactive>
        {{/if}}
        {{#if perms.canDelete}}
          {{#if perms.canAddHosts}}
            <dd.Separator />
          {{/if}}
          <dd.Interactive @color='critical' {{on 'click' (fn @delete @model)}}>
            {{t 'resources.host-set.actions.delete'}}
          </dd.Interactive>
        {{/if}}
      </Dropdown>
    {{/if}}
  {{/let}}
</template>
