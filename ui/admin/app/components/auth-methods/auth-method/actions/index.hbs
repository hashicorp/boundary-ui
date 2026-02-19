{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

{{#if (or @model.isOIDC @model.isLDAP)}}
  <Hds::Dropdown class='change-state' data-test-change-state as |dd|>
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
  </Hds::Dropdown>
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
    <Hds::Dropdown data-test-manage-auth-method as |dd|>
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
    </Hds::Dropdown>
  {{/if}}
{{/let}}