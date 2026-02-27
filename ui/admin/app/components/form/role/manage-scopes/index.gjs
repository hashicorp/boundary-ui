/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { GRANT_SCOPE_THIS, GRANT_SCOPE_CHILDREN, GRANT_SCOPE_DESCENDANTS } from 'api/models/role';
import Form from "rose/components/rose/form";
import Field from "@hashicorp/design-system-components/components/hds/form/toggle/field";
import includes from "@nullvoxpopuli/ember-composable-helpers/helpers/includes";
import { on } from "@ember/modifier";
import t from "ember-intl/helpers/t";
import Alert from "@hashicorp/design-system-components/components/hds/alert/index";
import Inline from "@hashicorp/design-system-components/components/hds/link/inline";
import docUrl from "core/helpers/doc-url";
import Button from "@hashicorp/design-system-components/components/hds/button/index";
import HelperText from "@hashicorp/design-system-components/components/hds/form/helper-text/index";

export default class FormRoleManageScopesIndexComponent extends Component {
  // =attributes

  keywords = {
    keyThis: GRANT_SCOPE_THIS,
    keyChildren: GRANT_SCOPE_CHILDREN,
    keyDescendants: GRANT_SCOPE_DESCENDANTS,
  };

  /**
   * Returns true if role is global level and either
   * "children" or "descendants" is toggled on.
   * @type {boolean}
   */
  get showAlert() {
    return (
      this.args.model.scope.isGlobal &&
      (this.args.model.grant_scope_ids.includes(GRANT_SCOPE_CHILDREN) ||
        this.args.model.grant_scope_ids.includes(GRANT_SCOPE_DESCENDANTS))
    );
  }

  /**
   * Returns true if global role does not have "descendants" toggled on
   * or if org role does not have "children" toggled on.
   * @type {boolean}
   */
  get showManageScopesBtn() {
    return (
      (this.args.model.scope.isGlobal &&
        !this.args.model.grant_scope_ids.includes(GRANT_SCOPE_DESCENDANTS)) ||
      (this.args.model.scope.isOrg &&
        !this.args.model.grant_scope_ids.includes(GRANT_SCOPE_CHILDREN))
    );
  }

  // =actions

  /**
   * Handles toggle event changes for selectedGrantScopeIDs
   * @param {object} event
   */
  @action
  toggleField(event) {
    const { checked, value } = event.target;
    const removeValue = (value) => {
      this.args.model.grant_scope_ids = this.args.model.grant_scope_ids.filter(
        (item) => item !== value,
      );
    };
    if (checked) {
      this.args.model.grant_scope_ids = [
        ...this.args.model.grant_scope_ids,
        value,
      ];
      if (value === GRANT_SCOPE_CHILDREN) {
        removeValue(GRANT_SCOPE_DESCENDANTS);
      }
      if (value === GRANT_SCOPE_DESCENDANTS) {
        removeValue(GRANT_SCOPE_CHILDREN);
      }
    } else {
      removeValue(value);
    }
  }
<template>
<Form class="full-width role-manage-scopes-form" @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} as |form|>

  <Field @value={{this.keywords.keyThis}} name={{this.keywords.keyThis}} checked={{includes this.keywords.keyThis @model.grant_scope_ids}} disabled={{form.disabled}} {{on "change" this.toggleField}} as |F|>
    <F.Label>{{t "resources.role.scope.form.this.label"}}</F.Label>
    <F.HelperText>{{t "resources.role.scope.form.this.help" scopeDisplayName=(if @model.scope.name @model.scope.name @model.scope.id)}}</F.HelperText>
  </Field>

  <Field @value={{this.keywords.keyChildren}} name={{this.keywords.keyChildren}} checked={{includes this.keywords.keyChildren @model.grant_scope_ids}} disabled={{form.disabled}} {{on "change" this.toggleField}} as |F|>
    <F.Label>{{t "resources.role.scope.form.children.label"}}</F.Label>
    <F.HelperText>{{if @model.scope.isGlobal (t "resources.role.scope.form.children.help.0") (t "resources.role.scope.form.children.help.1")}}</F.HelperText>
  </Field>

  {{#if @model.scope.isGlobal}}
    <Field @value={{this.keywords.keyDescendants}} name={{this.keywords.keyDescendants}} checked={{includes this.keywords.keyDescendants @model.grant_scope_ids}} disabled={{form.disabled}} {{on "change" this.toggleField}} as |F|>
      <F.Label>{{t "resources.role.scope.form.descendants.label"}}</F.Label>
      <F.HelperText>{{t "resources.role.scope.form.descendants.help"}}</F.HelperText>
    </Field>
  {{/if}}

  {{#if this.showAlert}}
    <Alert @type="compact" as |A|>
      <A.Description>
        {{t "resources.role.scope.messages.keywords-selected.description" htmlSafe=true}}
        <Inline @color="secondary" @href={{docUrl "role.add-grant-scopes"}}>
          {{t "resources.role.scope.messages.keywords-selected.link"}}
        </Inline>
      </A.Description>
    </Alert>
  {{/if}}

  {{#if this.showManageScopesBtn}}
    <Button @text={{t "resources.role.scope.actions.manage-custom-scopes.text"}} @color="secondary" @icon={{if @showCheckIcon "check-circle"}} @route={{if @model.scope.isGlobal "scopes.scope.roles.role.manage-scopes.manage-custom-scopes" "scopes.scope.roles.role.manage-scopes.manage-org-projects"}} @model={{if @model.scope.isOrg @model.scope.id}} data-test-manage-custom-scopes-button />

    <HelperText @controlId="for-manage-custom-scopes-button" class="manage-custom-scopes-helper-text">
      {{t "resources.role.scope.actions.manage-custom-scopes.help"}}
    </HelperText>
  {{/if}}

  <form.actions @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
</Form></template>}
