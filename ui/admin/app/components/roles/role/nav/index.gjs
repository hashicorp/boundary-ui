import Tabs from "rose/components/rose/nav/tabs";
import t from "ember-intl/helpers/t";
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Tabs as |nav|>
  <nav.link @route="scopes.scope.roles.role.index">
    {{t "titles.settings"}}
  </nav.link>
  <nav.link @route="scopes.scope.roles.role.scopes">
    {{t "resources.role.scope.title_plural"}}
  </nav.link>
  <nav.link @route="scopes.scope.roles.role.principals">
    {{t "resources.role.principal.title_plural"}}
  </nav.link>
  <nav.link @route="scopes.scope.roles.role.grants">
    {{t "resources.role.grant.title_plural"}}
  </nav.link>
</Tabs></template>