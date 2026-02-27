/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Tabs from 'rose/components/rose/nav/tabs';
import t from 'ember-intl/helpers/t';
<template>
  <Tabs as |nav|>
    <nav.link
      @route='scopes.scope.host-catalogs.host-catalog.host-sets.host-set.index'
    >
      {{t 'titles.details'}}
    </nav.link>
    <nav.link
      @route='scopes.scope.host-catalogs.host-catalog.host-sets.host-set.hosts'
    >
      {{t 'resources.host.title_plural'}}
    </nav.link>
  </Tabs>
</template>
