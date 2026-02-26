/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { A } from '@ember/array';
import Form from "rose/components/rose/form";
import { fn, array, hash } from "@ember/helper";
import t from "ember-intl/helpers/t";
import Table from "@hashicorp/design-system-components/components/hds/table/index";
import Field from "@hashicorp/design-system-components/components/hds/form/checkbox/field";
import { on } from "@ember/modifier";
import CredSourceTypeBadge from "admin/components/cred-source-type-badge/index";

export default class FormTargetAddInjectedApplicationCredentialSourcesIndexComponent extends Component {
  // =properties

  /**
   * Array of selected credential source IDs.
   * @type {EmberArray}
   */
  selectedCredentialSourceIDs = A();

  // =actions

  /**
   * Add/Remove credential source to current selection
   * @param {string} credentialSourceId
   */
  @action
  toggleCredentialSource(credentialSourceId) {
    if (!this.selectedCredentialSourceIDs.includes(credentialSourceId)) {
      this.selectedCredentialSourceIDs.addObject(credentialSourceId);
    } else {
      this.selectedCredentialSourceIDs.removeObject(credentialSourceId);
    }
  }
<template>
<Form class="full-width" @onSubmit={{fn @submit this.selectedCredentialSourceIDs}} @cancel={{@cancel}} @disabled={{@model.isSaving}} as |form|>
  <form.actions @submitText={{t "resources.target.actions.add-injected-application-credential-sources"}} @cancelText={{t "actions.cancel"}} />

  <Table @model={{@filteredCredentialSources}} @columns={{array (hash label=(t "form.id.label")) (hash label=(t "form.name.label")) (hash label=(t "form.type.label"))}} @valign="middle">
    <:body as |B|>
      <B.Tr>
        <B.Td data-test-credential-source={{B.data.type}}>
          <Field {{on "change" (fn this.toggleCredentialSource B.data.id)}} as |F|>
            <F.Label>{{B.data.id}}</F.Label>
            <F.HelperText>{{B.data.description}}</F.HelperText>
          </Field>
        </B.Td>
        <B.Td>{{B.data.name}}</B.Td>
        <B.Td><CredSourceTypeBadge @model={{B.data}} /></B.Td>
      </B.Tr>
    </:body>
  </Table>
</Form></template>}
