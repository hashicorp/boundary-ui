/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Tabs from 'rose/components/rose/nav/tabs';
import t from 'ember-intl/helpers/t';
import can from 'admin/helpers/can';
<template>
  <Tabs as |nav|>
    <nav.link @route='scopes.scope.host-catalogs.host-catalog.index'>
      {{t 'titles.details'}}
    </nav.link>
    {{#if (can 'navigate host-catalog' @model collection='hosts')}}
      <nav.link @route='scopes.scope.host-catalogs.host-catalog.hosts'>
        {{t 'resources.host.title_plural'}}
      </nav.link>
    {{/if}}
    {{#if (can 'navigate host-catalog' @model collection='host-sets')}}
      <nav.link @route='scopes.scope.host-catalogs.host-catalog.host-sets'>
        {{t 'resources.host-set.title_plural'}}
      </nav.link>
    {{/if}}
  </Tabs>
</template>
