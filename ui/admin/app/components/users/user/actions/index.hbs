{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

{{#let
  (hash
    canAddAccounts=(can 'addAccounts user' @model)
    canDelete=(can 'delete model' @model)
  )
  as |perms|
}}
  {{#if (or perms.canAddAccounts perms.canDelete)}}
    <Hds::Dropdown data-test-manage-user-dropdown as |dd|>
      <dd.ToggleButton @text={{t 'actions.manage'}} @color='secondary' />
      {{#if perms.canAddAccounts}}
        <dd.Interactive @route='scopes.scope.users.user.add-accounts'>
          {{t 'resources.user.actions.add-accounts'}}
        </dd.Interactive>
      {{/if}}
      {{#if perms.canDelete}}
        {{#if perms.canAddAccounts}}
          <dd.Separator />
        {{/if}}
        <dd.Interactive
          @color='critical'
          @disabled={{@model.canSave}}
          {{on 'click' (fn @delete @model)}}
        >
          {{t 'resources.user.actions.delete'}}
        </dd.Interactive>
      {{/if}}
    </Hds::Dropdown>
  {{/if}}
{{/let}}