import Tabs from "rose/components/rose/nav/tabs";
import t from "ember-intl/helpers/t";
import can from "admin/helpers/can";
import or from "ember-truth-helpers/helpers/or";
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Tabs as |nav|>
  <nav.link @route="scopes.scope.auth-methods.auth-method.index">
    {{t "titles.details"}}
  </nav.link>
  {{#if (can "navigate model" @model collection="accounts")}}

    <nav.link @route="scopes.scope.auth-methods.auth-method.accounts">
      {{t "resources.account.title_plural"}}
    </nav.link>
  {{/if}}

  {{#if (can "navigate model" @model collection="managed-groups")}}
    {{#if (or @model.isOIDC @model.isLDAP)}}
      <nav.link @route="scopes.scope.auth-methods.auth-method.managed-groups">
        {{t "resources.managed-group.title_plural"}}
      </nav.link>
    {{/if}}
  {{/if}}
</Tabs></template>