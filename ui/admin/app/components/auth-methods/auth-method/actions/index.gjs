import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

// rose
import RoseDropdown from 'rose/components/rose/dropdown';
import RoseForm from 'rose/components/rose/form';

// modifiers
import { on } from '@ember/modifier';

// helpers
import can from 'ember-can/helpers/can';
import t from 'ember-intl/helpers/t';
import { concat, fn } from '@ember/helper';
import { or } from 'ember-truth-helpers';

export default class AuthMethodsAuthMethodAccountsAccountActionsIndex extends Component {
  @service authMethodActions;

  <template>
    {{#if (or @model.isOIDC @model.isLDAP)}}
      <RoseDropdown
        @text={{t (concat 'states.' @model.state)}}
        @icon={{if
          @model.isInactive
          'flight-icons/svg/x-circle-16'
          (if
            @model.isPrivate
            'flight-icons/svg/lock-16'
            'flight-icons/svg/check-circle-16'
          )
        }}
        @dropdownRight={{true}}
        as |dropdown|
      >
        <dropdown.section @title={{t 'actions.change-state'}}>
          <RoseForm as |form|>
            <form.radioGroup
              @name='theme'
              @selectedValue={{@model.state}}
              @changed={{fn this.authMethodActions.changeState @model}}
              as |radioGroup|
            >
              {{#each @model.options.state as |state|}}
                <dropdown.item>
                  <radioGroup.radio
                    @label={{t (concat 'states.' state)}}
                    @value={{state}}
                  />
                </dropdown.item>
              {{/each}}
            </form.radioGroup>
          </RoseForm>
        </dropdown.section>
      </RoseDropdown>
    {{/if}}

    <RoseDropdown
      @text={{t 'actions.manage'}}
      @dropdownRight={{true}}
      as |dropdown|
    >
      {{#if @model.isPrimary}}
        <dropdown.button
          @disabled={{@model.canSave}}
          {{on 'click' (fn this.authMethodActions.removeAsPrimary @model)}}
        >
          {{t 'resources.auth-method.actions.remove-as-primary'}}
        </dropdown.button>
      {{else}}
        <dropdown.button
          @disabled={{@model.canSave}}
          {{on 'click' (fn this.authMethodActions.makePrimary @model)}}
        >
          {{t 'resources.auth-method.actions.make-primary'}}
        </dropdown.button>
      {{/if}}
      {{#if (can 'create model' @model collection='accounts')}}
        <dropdown.link
          @route='scopes.scope.auth-methods.auth-method.accounts.new'
          @model={{@model}}
        >
          {{t 'resources.account.actions.create'}}
        </dropdown.link>
      {{/if}}

      {{#if (can 'create model' @model collection='managed-groups')}}
        {{#if (or @model.isOIDC @model.isLDAP)}}
          <dropdown.link
            @route='scopes.scope.auth-methods.auth-method.managed-groups.new'
            @model={{@model}}
          >
            {{t 'resources.managed-group.actions.create'}}
          </dropdown.link>
        {{/if}}
      {{/if}}

      {{#if (can 'delete auth-method' @model)}}
        <dropdown.separator />
        <dropdown.button
          @style='danger'
          @disabled={{@model.canSave}}
          {{on 'click' (fn this.authMethodActions.delete @model)}}
        >
          {{t 'resources.auth-method.actions.delete'}}
        </dropdown.button>
      {{/if}}
    </RoseDropdown>
  </template>
}
