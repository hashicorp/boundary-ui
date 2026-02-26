import { hash, fn } from '@ember/helper';
import can from 'admin/helpers/can';
import or from 'ember-truth-helpers/helpers/or';
import Dropdown from '@hashicorp/design-system-components/components/hds/dropdown/index';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
<template>
  {{#let
    (hash
      canCreateHosts=(can 'create model' @model collection='hosts')
      canCreateHostSets=(can 'create model' @model collection='host-sets')
      canDelete=(can 'delete model' @model)
    )
    as |perms|
  }}
    {{#if (or perms.canCreateHosts perms.canCreateHostSets perms.canDelete)}}
      <Dropdown data-test-manage-host-catalogs-dropdown as |dd|>
        <dd.ToggleButton @text={{t 'actions.manage'}} @color='secondary' />
        {{#if perms.canCreateHosts}}
          <dd.Interactive
            @route='scopes.scope.host-catalogs.host-catalog.hosts.new'
            @model={{@model}}
          >
            {{t 'resources.host.actions.create'}}
          </dd.Interactive>
        {{/if}}
        {{#if perms.canCreateHostSets}}
          <dd.Interactive
            @route='scopes.scope.host-catalogs.host-catalog.host-sets.new'
            @model={{@model}}
          >
            {{t 'resources.host-set.actions.create'}}
          </dd.Interactive>
        {{/if}}
        {{#if perms.canDelete}}
          {{#if (or perms.canCreateHosts perms.canCreateHostSets)}}
            <dd.Separator />
          {{/if}}
          <dd.Interactive @color='critical' {{on 'click' (fn @delete @model)}}>
            {{t 'resources.host-catalog.actions.delete'}}
          </dd.Interactive>
        {{/if}}
      </Dropdown>
    {{/if}}
  {{/let}}
</template>
