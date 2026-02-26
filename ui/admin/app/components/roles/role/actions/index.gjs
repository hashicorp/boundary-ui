import { hash, fn } from '@ember/helper';
import can from 'admin/helpers/can';
import or from 'ember-truth-helpers/helpers/or';
import Dropdown from '@hashicorp/design-system-components/components/hds/dropdown/index';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
<template>
  {{#let
    (hash
      canAddPrincipals=(can 'addPrincipals role' @model)
      canSetGrantScopes=(can 'setGrantScopes role' @model)
      canDelete=(can 'delete model' @model)
    )
    as |perms|
  }}
    {{#if (or perms.canAddPrincipals perms.canSetGrantScopes perms.canDelete)}}
      <Dropdown data-test-manage-roles-dropdown as |dd|>
        <dd.ToggleButton @text={{t 'actions.manage'}} @color='secondary' />
        {{#if perms.canAddPrincipals}}
          <dd.Interactive
            @route='scopes.scope.roles.role.add-principals'
            data-test-manage-role-principals
          >
            {{t 'resources.role.principal.actions.add-principals'}}
          </dd.Interactive>
        {{/if}}
        {{#if perms.canSetGrantScopes}}
          <dd.Interactive
            @route='scopes.scope.roles.role.manage-scopes'
            data-test-manage-dropdown-scopes
          >
            {{t 'resources.role.scope.actions.manage-scopes'}}
          </dd.Interactive>
        {{/if}}
        {{#if perms.canDelete}}
          {{#if (or perms.canAddPrincipals perms.canSetGrantScopes)}}
            <dd.Separator />
          {{/if}}
          <dd.Interactive
            @color='critical'
            @disabled={{@model.canSave}}
            {{on 'click' (fn @delete @model)}}
          >
            {{t 'resources.role.actions.delete'}}
          </dd.Interactive>
        {{/if}}
      </Dropdown>
    {{/if}}
  {{/let}}
</template>
