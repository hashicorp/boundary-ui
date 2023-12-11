import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

// rose
import RoseDropdown from 'rose/components/rose/dropdown';

// modifiers
import { on } from '@ember/modifier';

// helpers
import can from 'ember-can/helpers/can';
import t from 'ember-intl/helpers/t';
import { fn } from '@ember/helper';

export default class AuthMethodsAuthMethodAccountsAccountActionsIndex extends Component {
  @service accountActions;

  <template>{{#if (can 'delete account' @model)}}
  <RoseDropdown
    @text={{t 'actions.manage'}}
    @dropdownRight={{true}}
    as |dropdown|
  >
    <dropdown.button
      @style='danger'
      @disabled={{@model.canSave}}
      {{on 'click' (fn this.accountActions.delete @model)}}
    >
      {{t 'resources.account.actions.delete'}}
    </dropdown.button>
  </RoseDropdown>
{{/if}}</template>
}