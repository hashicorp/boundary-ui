import or from 'ember-truth-helpers/helpers/or';
import Dropdown from '@hashicorp/design-system-components/components/hds/dropdown/index';
import t from 'ember-intl/helpers/t';
import { concat, fn, hash } from '@ember/helper';
import eq from 'ember-truth-helpers/helpers/eq';
import { on } from '@ember/modifier';
import can from 'admin/helpers/can';
<template>
  {{#if (or @model.isOIDC @model.isLDAP)}}
    <Dropdown class='change-state' data-test-change-state as |dd|>
      <dd.Title @text={{t 'actions.change-state'}} />
      <dd.ToggleButton
        @text={{t (concat 'states.' @model.state)}}
        @color='secondary'
        @icon={{if
          @model.isInactive
          'x-circle'
          (if @model.isPrivate 'lock' 'check-circle')
        }}
      />
      {{#each @model.options.state as |state|}}
        <dd.Radio
          checked={{eq @model.state state}}
          @value={{state}}
          {{on 'change' (fn @changeState @model state)}}
        >
          {{t (concat 'states.' state)}}
        </dd.Radio>
      {{/each}}
    </Dropdown>
  {{/if}}
  {{#let
    (hash
      canCreateAccount=(can 'create model' @model collection='accounts')
      canCreateManagedGroup=(can
        'create model' @model collection='managed-groups'
      )
      canDelete=(can 'delete auth-method' @model)
    )
    as |perms|
  }}
    {{#if
      (or perms.canCreateAccount perms.canCreateManagedGroup perms.canDelete)
    }}
      <Dropdown data-test-manage-auth-method as |dd|>
        <dd.ToggleButton @text={{t 'actions.manage'}} @color='secondary' />
        {{#if @model.isPrimary}}
          <dd.Interactive {{on 'click' (fn @removeAsPrimary @model)}}>
            {{t 'resources.auth-method.actions.remove-as-primary'}}
          </dd.Interactive>
        {{else}}
          <dd.Interactive {{on 'click' (fn @makePrimary @model)}}>
            {{t 'resources.auth-method.actions.make-primary'}}
          </dd.Interactive>
        {{/if}}
        {{#if perms.canCreateAccount}}
          <dd.Interactive
            @route='scopes.scope.auth-methods.auth-method.accounts.new'
            @model={{@model}}
          >
            {{t 'resources.account.actions.create'}}
          </dd.Interactive>
        {{/if}}
        {{#if perms.canCreateManagedGroup}}
          {{#if (or @model.isOIDC @model.isLDAP)}}
            <dd.Interactive
              @route='scopes.scope.auth-methods.auth-method.managed-groups.new'
              @model={{@model}}
            >
              {{t 'resources.managed-group.actions.create'}}
            </dd.Interactive>
          {{/if}}
        {{/if}}
        {{#if perms.canDelete}}
          <dd.Separator />
          <dd.Interactive @color='critical' {{on 'click' (fn @delete @model)}}>
            {{t 'resources.auth-method.actions.delete'}}
          </dd.Interactive>
        {{/if}}
      </Dropdown>
    {{/if}}
  {{/let}}
</template>
