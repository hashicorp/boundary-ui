import Tabs from "rose/components/rose/nav/tabs";
import t from "ember-intl/helpers/t";
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Tabs as |nav|>
  <nav.link @route="scopes.scope.groups.group.index">
    {{t "titles.details"}}
  </nav.link>
  <nav.link @route="scopes.scope.groups.group.members">
    {{t "resources.group.messages.members.title"}}
  </nav.link>
</Tabs></template>