/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { A } from '@ember/array';

export default class FormRoleAddPrincipalsIndexComponent extends Component {
  // =properties

  /**
   * Array of selected principal IDs.
   * @type {EmberArray}
   */
  selectedPrincipalIDs = A();

  /**
   * Checks for unassigned principals.
   * True if there are users or groups not yet added to this role.
   * @param {[UserModel, GroupModel]} filteredPrincipals
   * @type {boolean}
   */
  @computed('filteredPrincipals.length')
  get hasAvailablePrincipals() {
    return this.filteredPrincipals.length > 0;
  }

  /**
   * Principals not currently assigned to a role.
   * @type {[UserModel, GroupModel, ManagedGroupModel]}
   */
  @computed('args.{model,model.principals.[],users,groups,managedGroups}')
  get filteredPrincipals() {
    // Retrieve principal IDs assigned to current role
    const currentPrincipalIDs = this.args.model.principals.map(
      (principal) => principal.id,
    );

    // Retrieve principal IDs not assigned to current role
    const unassignedUsers = this.args.users.filter(
      ({ id }) => !currentPrincipalIDs.includes(id),
    );
    const unassignedGroups = this.args.groups.filter(
      ({ id }) => !currentPrincipalIDs.includes(id),
    );
    const unassignedManagedGroups = this.args.managedGroups.filter(
      ({ id }) => !currentPrincipalIDs.includes(id),
    );

    return [
      ...unassignedUsers,
      ...unassignedGroups,
      ...unassignedManagedGroups,
    ];
  }

  // =actions

  @action
  togglePrincipal(principal) {
    if (!this.selectedPrincipalIDs.includes(principal.id)) {
      this.selectedPrincipalIDs.addObject(principal.id);
    } else {
      this.selectedPrincipalIDs.removeObject(principal.id);
    }
  }

  @action
  submit(fn) {
    fn(this.selectedPrincipalIDs);
  }
}

{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

{{#if this.hasAvailablePrincipals}}
  <Rose::Form
    class='full-width'
    @onSubmit={{fn this.submit @submit}}
    @cancel={{@cancel}}
    @disabled={{@model.isSaving}}
    as |form|
  >

    <form.actions
      @submitText={{t 'actions.add-principals'}}
      @cancelText={{t 'actions.cancel'}}
    />

    <Hds::Table
      @model={{this.filteredPrincipals}}
      @columns={{array
        (hash label=(t 'form.name.label'))
        (hash label=(t 'form.id.label'))
        (hash label=(t 'form.type.label'))
        (hash label=(t 'resources.scope.title'))
        (hash label=(t 'form.description.label'))
      }}
      @valign='middle'
    >
      <:body as |B|>
        <B.Tr>
          <B.Td>

            <Hds::Form::Checkbox::Field
              {{on 'change' (fn this.togglePrincipal B.data)}}
              as |F|
            >
              <F.Label>{{B.data.displayName}}</F.Label>
              {{#if B.data.accountName}}
                <F.HelperText>
                  <Hds::Badge @text={{B.data.accountName}} />
                </F.HelperText>
              {{/if}}
            </Hds::Form::Checkbox::Field>
          </B.Td>
          <B.Td>{{B.data.id}}</B.Td>
          <B.Td><PrincipalTypeBadge @model={{B.data}} /></B.Td>
          <B.Td><ScopeBadge @scope={{B.data.scopeModel}} /></B.Td>
          <B.Td>{{B.data.description}}</B.Td>
        </B.Tr>
      </:body>
    </Hds::Table>
  </Rose::Form>
{{/if}}

{{#unless this.hasAvailablePrincipals}}
  <Rose::Layout::Centered>
    <Hds::ApplicationState as |A|>
      <A.Header @title={{t 'resources.role.principal.messages.none.title'}} />
      <A.Body
        @text={{t 'resources.role.principal.messages.none.description'}}
      />
      <A.Footer as |F|>
        <F.LinkStandalone
          @icon='arrow-left'
          @text={{t 'actions.back'}}
          @route='scopes.scope.roles.role.principals'
        />
      </A.Footer>
    </Hds::ApplicationState>
  </Rose::Layout::Centered>
{{/unless}}