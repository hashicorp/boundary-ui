import { hash } from '@ember/helper';
import can from 'admin/helpers/can';
import or from 'ember-truth-helpers/helpers/or';
import Dropdown from '@hashicorp/design-system-components/components/hds/dropdown/index';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
<template>
  {{#let
    (hash
      canAddMembers=(can 'addMembers group' @model)
      canDelete=(can 'delete model' @model)
    )
    as |perms|
  }}
    {{#if (or perms.canAddMembers perms.canDelete)}}
      <Dropdown data-test-manage-group-dropdown as |dd|>
        <dd.ToggleButton @text={{t 'actions.manage'}} @color='secondary' />
        {{#if perms.canAddMembers}}
          <dd.Interactive @route='scopes.scope.groups.group.add-members'>
            {{t 'resources.group.actions.add-members'}}
          </dd.Interactive>
        {{/if}}
        {{#if perms.canDelete}}
          {{#if perms.canAddMembers}}
            <dd.Separator />
          {{/if}}
          <dd.Interactive
            @color='critical'
            @disabled={{@model.canSave}}
            {{on 'click' @delete}}
          >
            {{t 'resources.group.actions.delete'}}
          </dd.Interactive>
        {{/if}}
      </Dropdown>
    {{/if}}
  {{/let}}
</template>
