{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

{{#if this.hasAvailableAccounts}}
  <Rose::Form
    class='full-width'
    @onSubmit={{fn this.submit @submit}}
    @cancel={{@cancel}}
    @disabled={{@model.isSaving}}
    as |form|
  >

    <form.actions
      @submitText={{t 'resources.user.actions.add-accounts'}}
      @cancelText={{t 'actions.cancel'}}
    />

    <Hds::Table
      @model={{this.filteredAccounts}}
      @columns={{array
        (hash label=(t 'form.id.label'))
        (hash label=(t 'form.name.label'))
        (hash label=(t 'form.type.label'))
        (hash label=(t 'resources.auth-method.title'))
      }}
      @valign='middle'
    >
      <:body as |B|>
        <B.Tr>
          <B.Td>
            <Hds::Form::Checkbox::Field
              {{on 'change' (fn this.toggleAccount B.data.id)}}
              as |F|
            >
              <F.Label>{{B.data.id}}</F.Label>
              <F.HelperText>{{B.data.description}}</F.HelperText>
            </Hds::Form::Checkbox::Field>
          </B.Td>
          <B.Td>{{B.data.accountName}}</B.Td>
          <B.Td>
            <Hds::Badge
              @text={{t (concat 'resources.auth-method.types.' B.data.type)}}
            />
          </B.Td>
          <B.Td>
            <Hds::Text::Code>
              {{B.data.auth_method_id}}
            </Hds::Text::Code>
          </B.Td>
        </B.Tr>
      </:body>
    </Hds::Table>
  </Rose::Form>
{{/if}}

{{#unless this.hasAvailableAccounts}}
  <Rose::Layout::Centered>
    <Hds::ApplicationState as |A|>
      <A.Header @title={{t 'resources.user.messages.no-accounts.title'}} />
      <A.Body @text={{t 'resources.user.messages.no-accounts.description'}} />
      <A.Footer as |F|>
        <F.LinkStandalone
          @icon='arrow-left'
          @text={{t 'actions.back'}}
          @route='scopes.scope.users.user.accounts'
        />
      </A.Footer>
    </Hds::ApplicationState>
  </Rose::Layout::Centered>
{{/unless}}