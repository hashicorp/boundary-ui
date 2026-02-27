/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { A } from '@ember/array';
import Form from "rose/components/rose/form";
import { fn, array, hash } from "@ember/helper";
import t from "ember-intl/helpers/t";
import Table from "@hashicorp/design-system-components/components/hds/table/index";
import Field from "@hashicorp/design-system-components/components/hds/form/checkbox/field";
import { on } from "@ember/modifier";
import Badge from "@hashicorp/design-system-components/components/hds/badge/index";
import Code from "@hashicorp/design-system-components/components/hds/text/code";
import ScopeBadge from "admin/components/scope-badge/index";
import Centered from "rose/components/rose/layout/centered";
import ApplicationState from "@hashicorp/design-system-components/components/hds/application-state/index";

export default class FormGroupAddMembersComponent extends Component {
  // =properties

  /**
   * Array of selected user IDs.
   * @type {EmberArray}
   */
  selectedMemberIDs = A();

  /**
   * Host sets not already added to the target.
   * @type {[UserModel]}
   */
  @computed('args.{model.member_ids.[],users.[]}')
  get availableUsers() {
    const memberIDs = this.args.model.member_ids;
    const users = this.args.users;
    return users.filter(({ id }) => !memberIDs.includes(id));
  }

  // =actions

  @action
  toggleMember(user) {
    if (!this.selectedMemberIDs.includes(user.id)) {
      this.selectedMemberIDs.addObject(user.id);
    } else {
      this.selectedMemberIDs.removeObject(user.id);
    }
  }

  @action
  submit(fn) {
    fn(this.selectedMemberIDs);
  }
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

{{#if this.availableUsers}}
  <Form class="full-width" @onSubmit={{fn this.submit @submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} as |form|>

    <form.actions @submitText={{t "resources.group.actions.add-members"}} @cancelText={{t "actions.cancel"}} />
    <Table @model={{this.availableUsers}} @columns={{array (hash label=(t "form.name.label")) (hash label=(t "form.id.label")) (hash label=(t "resources.scope.title")) (hash label=(t "form.description.label"))}} @valign="middle">
      <:body as |B|>
        <B.Tr>
          <B.Td>
            <Field {{on "change" (fn this.toggleMember B.data)}} as |F|>
              <F.Label>{{B.data.displayName}}</F.Label>
              {{#if B.data.accountName}}
                <F.HelperText>
                  <Badge @text={{B.data.accountName}} />
                </F.HelperText>
              {{/if}}
            </Field>
          </B.Td>
          <B.Td>
            <Code>
              {{B.data.id}}
            </Code>
          </B.Td>
          <B.Td><ScopeBadge @scope={{B.data.scopeModel}} /></B.Td>
          <B.Td>{{B.data.description}}</B.Td>
        </B.Tr>

      </:body>
    </Table>

  </Form>
{{/if}}

{{#unless this.availableUsers}}
  <Centered>
    <ApplicationState as |A|>
      <A.Header @title={{t "resources.group.messages.no-members.title"}} />
      <A.Body @text={{t "resources.group.messages.no-members.description"}} />
      <A.Footer as |F|>
        <F.LinkStandalone @icon="arrow-left" @text={{t "actions.back"}} @route="scopes.scope.groups.group.members" />
      </A.Footer>
    </ApplicationState>
  </Centered>
{{/unless}}</template>}
