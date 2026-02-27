/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { TYPES_CREDENTIAL_LIBRARY, TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE } from 'api/models/credential-library';
import { service } from '@ember/service';
import Group from "@hashicorp/design-system-components/components/hds/form/radio-card/group";
import t from "ember-intl/helpers/t";
import eq from "ember-truth-helpers/helpers/eq";
import { on } from "@ember/modifier";
import { fn, concat } from "@ember/helper";

export default class FormCredentialLibraryRadioComponent extends Component {
  // =services
  @service features;

  /**
   * Returns credential types, filtering out SSH if the feature is disabled.
   * @returns {Array.<string>}
   */
  get credentialTypes() {
    let types = [...TYPES_CREDENTIAL_LIBRARY];

    return this.features.isEnabled('ssh-target')
      ? types
      : types.filter(
          (type) => type !== TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
        );
  }
<template>
<Group @name={{t "form.type.label"}} @isRequired={{true}} @alignment="center" as |G|>
  <G.Legend>{{t "form.type.label"}}</G.Legend>
  {{#each this.credentialTypes as |type|}}
    <G.RadioCard @value={{type}} @maxWidth="20rem" @checked={{eq type @model.type}} {{on "input" (fn @changeType type)}} as |R|>
      <R.Label>{{t (concat "resources.credential-library.types." type)}}</R.Label>
      <R.Description>{{t (concat "resources.credential-library.help." type)}}</R.Description>
    </G.RadioCard>
  {{/each}}
</Group></template>}
