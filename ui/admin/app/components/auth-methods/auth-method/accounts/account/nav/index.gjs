import Tabs from "rose/components/rose/nav/tabs";
import t from "ember-intl/helpers/t";
import can from "admin/helpers/can";
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Tabs as |nav|>
  <nav.link @route="scopes.scope.auth-methods.auth-method.accounts.account.index">
    {{t "titles.details"}}
  </nav.link>
  {{#if @model.isPassword}}
    {{#if (can "setPassword account" @model)}}
      <nav.link @route="scopes.scope.auth-methods.auth-method.accounts.account.set-password">
        {{t "actions.set-password"}}
      </nav.link>
    {{/if}}
  {{/if}}
</Tabs></template>